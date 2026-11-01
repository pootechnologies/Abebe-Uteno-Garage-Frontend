import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash, ShoppingBag, Plus } from "lucide-react";
import { t } from "i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useCustomerStore from "@/stores/useCustomerStore.ts";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import toast from "react-hot-toast";
import Select from "react-select";
import axiosInstanceOld from "@/api/axiosOld.tsx";

const CustomerPurchaseAddModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([
    {
      product: null,
      part_number: "",
      unit: "",
      description: "",
      quantity: "",
      unitPrice: 0,
      stock: 0,
    },
  ]);
  const [products, setProducts] = useState([]);
  const [paymentStatusSecond, setPaymentStatusSecond] = useState("Pending");
  const [paidAmountSecond, setPaidAmountSecond] = useState(0);
  const [errors, setErrors] = useState([
    {
      product: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const itemRefs = useRef([]);
  const lastItemRef = useRef(null);

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [items.length]);

  const selectedCustomer = useCustomerStore((state) => state.selectedCustomer);
  const selectedCustomerId = selectedCustomer?.id ? selectedCustomer.id : null;
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`,
        );
        setProducts(
          response?.data?.results?.map((product) => ({
            value: product.id,
            label: product.part_number
              ? `${product.name} - ${product.part_number}`
              : product.name,
            unit: product.unit,
            buying_price: product.buying_price,
            selling_price: product.selling_price,
            part_number: product.part_number || "",
            stock: product.stock,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const mutation = useMutation({
    mutationFn: (payload) =>
      axiosInstanceOld.patch(
        `${API_ENDPOINTS.CREDIT_CUSTOMERS}${selectedCustomerId}`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerPurchaseExpenses"] });
      toast.success("Customer purchase added successfully");
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting the form:", error);
      toast.error("Error adding customer purchase");
    },
  });

  const resetForm = () => {
    setItems([
      {
        product: null,
        part_number: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: 0,
        stock: 0,
      },
    ]);
    setPaymentStatusSecond("Pending");
    setPaidAmountSecond(0);
    setErrors([
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "product") {
      newItems[index][field] = value;
      newItems[index].unit = value?.unit || "";
      newItems[index].unitPrice = value?.selling_price || 0;
      newItems[index].part_number = value?.part_number || "";
      newItems[index].stock = value?.stock || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
    const newErrors = [...errors];
    if (field === "product") {
      newErrors[index].product = !value ? t("product_name_required") : "";
    } else if (field === "quantity") {
      newErrors[index].quantity =
        value === ""
          ? t("quantity_required")
          : value <= 0
            ? t("quantity_must_greater_zero")
            : "";
    } else if (field === "unitPrice") {
      newErrors[index].unitPrice = value === "" ? t("unit_price_required") : "";
    }
    setErrors(newErrors);
  };

  const handleAddMore = () => {
    setItems([
      ...items,
      {
        product: null,
        part_number: "",
        unit: "",
        description: "",
        quantity: "",
        unitPrice: 0,
        stock: 0,
      },
    ]);
    setErrors([
      ...errors,
      {
        product: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const handleRemove = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = [...errors];
    items.forEach((item, index) => {
      if (!item.product) {
        newErrors[index].product = t("product_name_required");
        isValid = false;
      }
      if (item.quantity === "" || item.quantity <= 0) {
        newErrors[index].quantity =
          item.quantity === ""
            ? t("quantity_required")
            : t("quantity_must_greater_zero");
        isValid = false;
      }
      if (item.unitPrice === "" || item.unitPrice < 0) {
        newErrors[index].unitPrice = t("unit_price_required");
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const newData = items
    .filter((item) => item.product)
    .map((item) => ({
      payment_status: paymentStatusSecond,
      paid_amount: paidAmountSecond,
      products: {
        product: item.product.value,
        part_number: item.part_number,
        unit: item.unit,
        description: item.description,
        quantity: item.quantity,
        unit_price: parseFloat(item.unitPrice).toFixed(2),
      },
    }));

  const groupedNewData = newData.reduce((acc, item) => {
    const key = `${item.payment_status}-${item.paid_amount}`;
    if (!acc[key]) {
      acc[key] = {
        payment_status: item.payment_status,
        paid_amount: item.paid_amount,
        products: [],
      };
    }
    acc[key].products.push(item.products);
    return acc;
  }, {});

  const groupedNewDataArray = Object.values(groupedNewData);

  const payload = {
    id: selectedCustomer?.id,
    customer: selectedCustomer?.customer,
    customer_name: selectedCustomer?.customer_name,
    total_amount: selectedCustomer?.total_amount,
    payment_status: selectedCustomer?.payment_status,
    paid_amount: selectedCustomer?.paid_amount,
    unpaid_amount: selectedCustomer?.unpaid_amount,
    user: selectedCustomer?.user,
    credits: [...(selectedCustomer?.credits || []), ...groupedNewDataArray],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate(payload);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-50">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ShoppingBag className="h-6 w-6" />
            </div>
            {t("add_credit")}
          </h2>
          <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {items.length} {t("credit")}
          </p>
        </div>

        {/* Items list */}
        <div className="h-[55vh] overflow-auto pr-2 space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              ref={
                index === items.length - 1
                  ? lastItemRef
                  : (el) => (itemRefs.current[index] = el)
              }
              className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl space-y-5 relative shadow-sm"
            >
              {/* Product Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`products-${index}`}
                  className="block text-sm font-semibold text-muted-foreground"
                >
                  {t("product_name")}
                </label>
                <Select
                  isClearable
                  id={`products-${index}`}
                  options={products}
                  value={item.product}
                  onChange={(selectedOption) =>
                    handleChange(index, "product", selectedOption)
                  }
                  placeholder={t("select_product")}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: errors[index]?.product ? "red" : "var(--border)",
                      borderWidth: "2px",
                      backgroundColor: "transparent",
                      padding: "2px",
                      boxShadow: "none",
                      "&:hover": { borderColor: errors[index]?.product ? "red" : "rgb(16 185 129)" },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      zIndex: 100,
                    }),
                  }}
                />
                {errors[index]?.product && (
                  <p className="mt-1 text-sm text-red-600 font-medium">
                    {errors[index].product}
                  </p>
                )}
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit */}
                {/* <div className="space-y-1.5">
                  <label
                    htmlFor={`unit-${index}`}
                    className="block text-sm font-semibold text-muted-foreground"
                  >
                    {t("unit")}
                  </label>
                  <input
                    type="text"
                    id={`unit-${index}`}
                    value={item.unit}
                    disabled
                    onChange={(e) =>
                      handleChange(index, "unit", e.target.value)
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div> */}

                {/* Description */}
                {/* <div className="space-y-1.5">
                  <label
                    htmlFor={`description-${index}`}
                    className="block text-sm font-semibold text-muted-foreground"
                  >
                    {t("description")}
                  </label>
                  <input
                    type="text"
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div> */}



                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={`unitPrice-${index}`}
                    className="block text-sm font-semibold text-muted-foreground"
                  >
                    {t("unit_price")}
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    id={`unitPrice-${index}`}
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleChange(index, "unitPrice", e.target.value)
                    }
                    className={`w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors[index]?.unitPrice
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                      }`}
                  />
                  {errors[index]?.unitPrice && (
                    <p className="mt-1 text-sm text-red-600 font-medium">
                      {errors[index].unitPrice}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <div className="flex flex-row justify-between">
                    <label
                      htmlFor={`quantity-${index}`}
                      className="block text-sm font-semibold text-muted-foreground"
                    >
                      {t("quantity")}
                    </label>
                    {item.product && (
                      <span
                        className={`text-xs font-bold ${item.stock > 0 ? "text-emerald-600" : "text-red-500"
                          }`}
                      >
                        Stock available: {item.stock}
                      </span>
                    )}
                  </div>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    id={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                    min={1}
                    className={`w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors[index]?.quantity
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                      }`}
                  />
                  {errors[index]?.quantity && (
                    <p className="mt-1 text-sm text-red-600 font-medium">
                      {errors[index].quantity}
                    </p>
                  )}
                </div>

                {/* Total Price */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={`totalPrice-${index}`}
                    className="block text-sm font-semibold text-muted-foreground"
                  >
                    {t("total_price")}
                  </label>
                  <input
                    type="text"
                    id={`totalPrice-${index}`}
                    value={formatCurrency(item.quantity * item.unitPrice)}
                    disabled
                    className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Remove button */}
              <div className="flex justify-end pt-2">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemove(index)}
                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
                  >
                    <Trash className="mr-2 h-4 w-4" /> {t("remove")}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Payment Status & Paid Amount */}
          <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="paymentStatusSecond"
                  className="block text-sm font-semibold text-muted-foreground"
                >
                  {t("payment_status")}
                </label>
                <select
                  id="paymentStatusSecond"
                  value={paymentStatusSecond}
                  onChange={(e) => setPaymentStatusSecond(e.target.value)}
                  className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Pending">{t("pending")}</option>
                  <option value="Paid">{t("paid")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="paidAmountSecond"
                  className="block text-sm font-semibold text-muted-foreground"
                >
                  {t("paid_amount")}
                </label>
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="paidAmountSecond"
                  value={paidAmountSecond}
                  onChange={(e) =>
                    setPaidAmountSecond(parseFloat(e.target.value))
                  }
                  className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 pt-4 border-t border-muted">
          <Button
            type="button"
            onClick={handleAddMore}
            variant="outline"
            className="w-full sm:w-auto border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium transition-colors gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("add_more")}
          </Button>
          <div className="flex flex-row space-x-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 sm:flex-none rounded-lg font-medium transition-colors border-muted hover:bg-muted/50"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("submitting...")}
                </span>
              ) : (
                t("submit")
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPurchaseAddModal;

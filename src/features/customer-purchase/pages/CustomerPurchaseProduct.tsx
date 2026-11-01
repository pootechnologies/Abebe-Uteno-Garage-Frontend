import { useEffect, useState, useRef } from "react";
import { LayoutList, Plus, Trash, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import Select from "react-select";
import { t } from "i18next";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import axiosInstanceOld from "@/api/axiosOld.tsx";

const CustomerPurchaseProduct = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    {
      product: null,
      // unit: "",
      // description: "",
      quantity: "",
      unitPrice: 0,
      stock: 0,
    },
  ]);

  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState([
    {
      product: "",
      quantity: "",
      unitPrice: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paidAmountSecond, setPaidAmountSecond] = useState(0);

  const itemRefs = useRef([]);
  const lastItemRef = useRef(null);
  const isInitialMount = useRef(true);

  // useEffect(() => {
  //   if (isInitialMount.current) {
  //     isInitialMount.current = false;
  //     return;
  //   }
  //   if (lastItemRef.current) {
  //     lastItemRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [items.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`,
        );
        setProducts(
          response?.data?.all_results.map((product) => ({
            value: product,
            label: `${product.name} - ${product.part_number ?? "N/A"}`,
            name: product.name,
            part_number: product.part_number,
            // unit: product.unit,
            buying_price: product.buying_price,
            selling_price: product.selling_price,
            stock: product.stock,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstanceOld.get(`${API_ENDPOINTS.CUSTOMERS}?include_all=True`);
        setCustomers(
          response.data.all_results.map((customer) => ({
            value: customer.id,
            label: customer.organization,
            name: customer.name,
            organization: customer.organization,
          })),
        );
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const validateForm = () => {
    const newErrors = items.map((item) => ({
      product: !item.product ? t("product_name_required") : "",
      quantity:
        item.quantity === ""
          ? t("quantity_required")
          : item.quantity < 0
            ? t("quantity_must_greater_zero")
            : "",
      unitPrice:
        item.unitPrice === ""
          ? t("unit_price_required")
          : item.unitPrice < 0
            ? t("unit_price_must_greater_zero")
            : "",
    }));
    setErrors(newErrors);
    return !newErrors.some(
      (error) =>
        error.product !== "" || error.quantity !== "" || error.unitPrice !== "",
    );
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "product") {
      newItems[index][field] = value;
      // newItems[index].unit = value?.unit || "";
      newItems[index].unitPrice = parseFloat(value?.selling_price) || 0;
      newItems[index].stock = value?.stock || 0;
    } else if (field === "unitPrice") {
      const parsedValue = value === "" ? "" : parseFloat(value) || 0;
      newItems[index][field] = parsedValue;
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
          : value < 0
            ? t("quantity_must_greater_zero")
            : "";
    } else if (field === "unitPrice") {
      newErrors[index].unitPrice =
        value === ""
          ? t("unit_price_required")
          : value < 0
            ? t("unit_price_must_greater_zero")
            : "";
    }
    setErrors(newErrors);
  };

  const handleAddMore = () => {
    setItems([
      ...items,
      {
        product: null,
        // unit: "",
        // description: "",
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

  const handleCustomerChange = (selectedOption) => {
    setCustomer(selectedOption);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    const num = parseFloat(amount);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    const customerId = customer?.value || null;
    const formattedData = {
      customer: customerId,
      organization: customer?.organization || null,
      credits: [
        {
          receipt: "Receipt",
          payment_status: "Pending",
          paid_amount: paidAmountSecond,
          products: items.map((item) => ({
            product: String(item.product.value.id),
            // unit: item.unit,
            // description: item.description,
            quantity: item.quantity,
            unit_price: (parseFloat(item.unitPrice) || 0).toFixed(2),
          })),
        },
      ],
    };
    console.log(formattedData);
    try {
      const response = await axiosInstanceOld.post(
        API_ENDPOINTS.CREDIT_CUSTOMERS,
        formattedData,
      );
      toast.success("Customer credit submitted successfully!");
      setItems([
        {
          product: null,
          // unit: "",
          // description: "",
          quantity: "",
          unitPrice: 0,
        },
      ]);
      setCustomer(null);
      setPaidAmountSecond(0);
      setErrors([{ product: "", quantity: "", unitPrice: "" }]);
    } catch (error) {
      console.error("Error making POST request:", error);
      toast.error(error?.response?.data?.customer?.[0] || "Failed to submit purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Summary Sheet */}
      <div className="fixed top-0 right-0 h-full flex items-center z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-l-xl shadow-xl transition-all duration-200 flex items-center gap-2">
              <LayoutList className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] p-6 bg-white dark:bg-gray-900 border-l border-muted shadow-2xl">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold text-emerald-600">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <LayoutList className="h-4 w-4" />
                </div>
                {t("credit_summary")}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-3">
                {items
                  .filter((item) => item.product && item.quantity > 0)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="w-full p-3 bg-muted/20 border border-muted rounded-xl transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.product?.label}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-sm font-bold text-emerald-600">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-muted pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    {t("number_of_items")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {items.filter((item) => item.product && item.quantity > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    {t("sub_total")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-600 border-t border-muted pt-3">
                  <span>{t("total_amount")}</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("place_credit")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Customer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  {t("customer")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label
                    htmlFor="customer"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                  >
                    {t("customer")}
                  </label>
                  <Select
                    isClearable
                    id="customer"
                    options={customers}
                    value={customer}
                    onChange={handleCustomerChange}
                    className="w-full react-select-container"
                    classNamePrefix="react-select"
                    placeholder={t("select_customer_name")}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: "var(--border)",
                        backgroundColor: "transparent",
                        "&:hover": { borderColor: "var(--primary)" },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  {t("products") || "Products"}
                </h3>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    ref={
                      index === items.length - 1
                        ? lastItemRef
                        : (el) => (itemRefs.current[index] = el)
                    }
                    className="relative border border-muted/50 p-5 rounded-2xl bg-muted/20 space-y-5 animate-in slide-in-from-left-2 duration-300"
                  >
                    {/* Item header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                        {t("item") || "Item"} {index + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Product */}
                      <div>
                        <label
                          htmlFor={`products-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
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
                          getOptionLabel={(option) => `${option.name} - ${option.part_number ?? "N/A"}`}
                          getOptionValue={(option) => option.value.id}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: "0.75rem",
                              borderColor: errors[index]?.product ? "#ef4444" : "var(--border)",
                              backgroundColor: "transparent",
                              "&:hover": { borderColor: "var(--primary)" },
                            }),
                            menu: (base) => ({ ...base, borderRadius: "0.75rem", overflow: "hidden" }),
                          }}
                        />
                        {errors[index]?.product && (
                          <p className="mt-1 text-xs text-red-600">{errors[index].product}</p>
                        )}
                      </div>

                      {/* Unit */}
                      {/* <div>
                        <label
                          htmlFor={`unit-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
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
                          className="w-full h-11 px-3 rounded-xl bg-muted/50 border border-muted-foreground/20 transition-all outline-none disabled:opacity-50"
                        />
                      </div> */}

                      {/* Description */}
                      {/* <div>
                        <label
                          htmlFor={`description-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
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
                          className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                        />
                      </div> */}



                      {/* Unit Price */}
                      <div>
                        <label
                          htmlFor={`unitPrice-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
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
                          placeholder="0.00"
                          className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border ${errors[index]?.unitPrice ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                            } transition-all outline-none`}
                        />
                        {errors[index]?.unitPrice && (
                          <p className="mt-1 text-xs text-red-600">{errors[index].unitPrice}</p>
                        )}
                      </div>
                      {/* Quantity */}
                      {item.product && (
                        <div>
                          <div className="flex flex-row justify-between mb-1.5">
                            <label
                              htmlFor={`quantity-${index}`}
                              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                            >
                              {t("quantity")}
                            </label>
                            <span
                              className={`text-xs font-bold tracking-widest ${item.stock > 0
                                  ? "text-emerald-600"
                                  : "text-red-500"
                                }`}
                            >
                              Stock available: {item.stock}
                            </span>
                          </div>
                          <input
                            type="number" onWheel={(event) => event.currentTarget.blur()}
                            id={`quantity-${index}`}
                            value={item.quantity}
                            onChange={(e) =>
                              handleChange(index, "quantity", e.target.value)
                            }
                            className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border ${errors[index]?.quantity ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                              } transition-all outline-none`}
                          />
                          {errors[index]?.quantity && (
                            <p className="mt-1 text-xs text-red-600">{errors[index].quantity}</p>
                          )}
                        </div>
                      )}


                      {/* Total Price */}
                      <div>
                        <label
                          htmlFor={`totalPrice-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground  ml-1 block mb-1.5"
                        >
                          {t("total_price")}
                        </label>
                        <input
                          type="text"
                          id={`totalPrice-${index}`}
                          value={formatCurrency(item.quantity * item.unitPrice)}
                          disabled
                          className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border  focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                } transition-all outline-none`} />
                      </div>


                    </div>

                    <div className="flex justify-end pt-2">
                      {items.length > 1 && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
                          type="button"
                          onClick={() => handleRemove(index)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t("remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMore}
                  className="w-auto gap-2 rounded-xl border-dashed border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_more")}
                </Button>
              </div>
            </div>

            {/* Payment Section */}
            <div className="p-5 bg-muted/20 border border-muted/50 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  {t("payment_details") || "Payment Details"}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5">
                    {t("payment_status")}
                  </label>
                  <div className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-emerald-500/30 flex items-center">
                    <span className="text-sm font-semibold text-emerald-600">{t("pending")}</span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="paidAmountSecond"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                  >
                    {t("paid_amount")}
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    id="paidAmountSecond"
                    value={paidAmountSecond}
                    onChange={(e) =>
                      setPaidAmountSecond(parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={
                  errors.some(
                    (error) =>
                      error.product !== "" ||
                      error.quantity !== "" ||
                      error.unitPrice !== "",
                  ) || isSubmitting
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...") || "Submitting..."}
                  </div>
                ) : (
                  t("submit_purchase")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerPurchaseProduct;

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig.js";
import toast from "react-hot-toast";
import { Trash, ShoppingBag, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstanceOld from "@/api/axiosOld";

const AddOrderModal = ({ isOpen, onClose, selectedOrderId, id }) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([
    {
      selectedProduct: null,
      unit: "",
      package: null,
      unit_price: "",
      quantity: null,
      stock: 0,
      disabledPackage: false,
      disabledQuantity: false,
    },
  ]);
  const itemRefs = useRef([]);
  const { data: orderDetails = [], isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: ["orderDetails", selectedOrderId],
    queryFn: () =>
      axiosInstanceOld
        .get(`${API_ENDPOINTS.ORDERS}${selectedOrderId}`)
        .then((res) => res.data),
    enabled: !!selectedOrderId && isOpen,
  });
  const orderItems = orderDetails?.data?.items;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        setProducts(response.data.all_results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].selectedProduct = selectedOption.value;
    newItems[index].unit = selectedOption.value.unit;
    newItems[index].unit_price = selectedOption.value.selling_price;
    newItems[index].stock = selectedOption.value.stock;
    setItems(newItems);
  };

  const handleUnitPriceChange = (index, e) => {
    const newItems = [...items];
    newItems[index].unit_price = e.target.value;
    setItems(newItems);
  };

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    const quantity = e.target.value;
    newItems[index].quantity = quantity === "" ? null : parseInt(quantity, 10);
    newItems[index].disabledPackage = quantity !== "";
    if (newItems[index].disabledPackage) {
      newItems[index].package = null;
    }
    setItems(newItems);
  };

  const handlePackageChange = (index, e) => {
    const newItems = [...items];
    const packageValue = e.target.value;
    newItems[index].package = packageValue === "" ? null : parseInt(packageValue, 10);
    newItems[index].disabledQuantity = packageValue !== "";
    if (newItems[index].disabledQuantity) {
      newItems[index].quantity = null;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        selectedProduct: null,
        unit: "",
        package: null,
        unit_price: "",
        quantity: null,
        stock: 0,
        disabledPackage: false,
        disabledQuantity: false,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    itemRefs.current = itemRefs.current.filter((_, i) => i !== index);
  };

  useEffect(() => {
    if (itemRefs.current.length > 0) {
      const lastItemRef = itemRefs.current[itemRefs.current.length - 1];
      if (lastItemRef) {
        lastItemRef.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [items]);

  const queryClient = useQueryClient();
  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newOrderItems = items.map((item) => ({
        product: item.selectedProduct.id,
        product_name: item.selectedProduct.name,
        unit: item.unit,
        package: item.package,
        quantity: item.quantity || item.package * item.selectedProduct.piece,
        unit_price: item.unit_price || item.selectedProduct.selling_price,
        total_price: item.unit_price * (item.quantity || item.package * item.selectedProduct.piece),
        status: "Done",
      }));
      const updatedOrderItems = [...(orderItems || []), ...newOrderItems];
      const payload = {
        items: updatedOrderItems,
      };
      const response = await axiosInstanceOld.patch(
        `${API_ENDPOINTS.ORDERS}${id}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Order item Added successfully!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["orderDetails"] });
        handleClose();
      }
    } catch (error) {
      console.error("Error updating order items:", error);
      toast.error(error.response?.data?.error || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setItems([
      {
        selectedProduct: null,
        unit: "",
        package: null,
        unit_price: "",
        quantity: null,
        stock: 0,
        disabledPackage: false,
        disabledQuantity: false,
      },
    ]);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-[60]">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div>
          <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <ShoppingBag className="h-6 w-6" />
              </div>
              {t("add_orders")}
            </h2>
            <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {items.length} {t("product")}
            </p>
          </div>
          <div className="h-[60vh] overflow-auto pr-2 space-y-6">
            {items.map((item, index) => (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl space-y-5 relative shadow-sm"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor={`product-${index}`}
                    className="block text-sm font-semibold text-muted-foreground"
                  >
                    {t("product_name")}
                  </label>
                  <Select
                    id={`product-${index}`}
                    value={
                      item.selectedProduct
                        ? {
                            label: `${item.selectedProduct.name}${item.selectedProduct.part_number ? ` - ${item.selectedProduct.part_number}` : ""}`,
                            value: item.selectedProduct,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleProductChange(index, selectedOption)
                    }
                    options={products.map((product) => ({
                      label: `${product.name}${product.part_number ? ` - ${product.part_number}` : ""}`,
                      value: product,
                    }))}
                    placeholder={t("select_product")}
                    className="w-full react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: "var(--border)",
                        borderWidth: "2px",
                        backgroundColor: "transparent",
                        padding: "2px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "var(--emerald-500)" },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        zIndex: 100,
                      })
                    }}
                  />
                </div>
                {item.selectedProduct && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
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
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].unit = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    {/* <div className="space-y-1.5">
                      <label
                        htmlFor={`package-${index}`}
                        className="block text-sm font-semibold text-muted-foreground"
                      >
                        Package
                      </label>
                      <input
                        type="number" onWheel={(event) => event.currentTarget.blur()}
                        id={`package-${index}`}
                        value={item.package || ""}
                        onChange={(e) => handlePackageChange(index, e)}
                        className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={item.disabledPackage}
                      />
                    </div> */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`unit-price-${index}`}
                        className="block text-sm font-semibold text-muted-foreground"
                      >
                        {t("unit_price")}
                      </label>
                      <input
                        type="number" onWheel={(event) => event.currentTarget.blur()}
                        id={`unit-price-${index}`}
                        value={item.unit_price}
                        onChange={(e) => handleUnitPriceChange(index, e)}
                        className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-row justify-between items-center">
                        <label
                          htmlFor={`quantity-${index}`}
                          className="block text-sm font-semibold text-muted-foreground"
                        >
                          {t("quantity")}
                        </label>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.stock > 0 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          Stock: {item.stock}
                        </span>
                      </div>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        rules={{
                          required: !item.disabledQuantity
                            ? t("quantity_required")
                            : false,
                          min: {
                            value: 1,
                            message: t("quantity_must_greater_zero"),
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number" onWheel={(event) => event.currentTarget.blur()}
                            id={`quantity-${index}`}
                            min="1"
                            value={item.quantity === null ? "" : item.quantity}
                            onChange={(e) => {
                              handleQuantityChange(index, e);
                              field.onChange(e);
                            }}
                            className={`w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              errors.items?.[index]?.quantity
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-700"
                            }`}
                            disabled={item.disabledQuantity}
                          />
                        )}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-sm text-red-600 font-medium">
                          {errors.items[index].quantity.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  {items.length > 1 && (
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
                      type="button"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 pt-4 border-t border-muted">
            <Button
              type="button"
              onClick={addItem}
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
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting")}
                  </span>
                ) : t("submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;

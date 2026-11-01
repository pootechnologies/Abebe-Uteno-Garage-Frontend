import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, FileText } from "lucide-react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import usePerformaStore from "@/stores/usePerformaStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import axiosInstanceOld from "@/api/axiosOld";

// --- Helper Functions ---
const getProductOptions = (products: any[]) => {
  return products.map((product) => ({
    value: product,
    label: product.part_number ? `${product.name} - ${product.part_number}` : product.name,
    name: product.name,
    part_number: product.part_number,
    unit: product.unit,
    selling_price: product.selling_price,
    id: product.id,
    stock: product.stock || 0,
  }));
};

const formatCurrency = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// --- Interfaces ---
interface Item {
  product: string;
  product_name?: string;
  part_number?: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  service_charge?: number | "";
  performa_service_charge?: number | "";
  stock: number;
}

interface PerformaData {
  receipt: string;
  shanci_kutir: string;
  targa_kutir: string;
  service_charge?: string;
  products: Array<{
    product: string;
    product_name?: string;
    part_number?: string;
    unit: string;
    quantity: number;
    unit_price: string;
    product_service_charge?: string;
    service_price?: string;
  }>;
}

interface AddCustomerPerformaModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedCustomerPerforma: any;
  setIsAddPerformaModalOpen: (open: boolean) => void;
}

// --- Constants ---
const unitOptions = [
  { value: "PCS", label: "PCS" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Liter", label: "Liter" },
  { value: "pcs", label: "pcs" },
];

// --- Components ---
const ItemRow = ({
  index,
  item,
  control,
  errors,
  fieldsLength,
  lastItemRef,
  itemRefs,
  productOptions,
  handleProductChange,
  remove,
  t,
}: {
  index: number;
  item: any;
  control: any;
  errors: any;
  fieldsLength: number;
  lastItemRef: React.RefObject<HTMLDivElement>;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  productOptions: any[];
  handleProductChange: (option: any, index: number) => void;
  remove: (index: number) => void;
  t: any;
}) => {
  const watchedQuantity = useWatch({ control, name: `items.${index}.quantity` });
  const watchedUnitPrice = useWatch({ control, name: `items.${index}.unitPrice` });
  const watchedStock = useWatch({ control, name: `items.${index}.stock` });
  const productId = useWatch({ control, name: `items.${index}.product` });

  const total = (watchedQuantity || 0) * (watchedUnitPrice || 0);

  return (
    <div
      ref={index === fieldsLength - 1 ? lastItemRef : itemRefs.current[index]}
      className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl space-y-5 relative shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Selector */}
        <div className="space-y-1.5">
          <label htmlFor={`product-${index}`} className="block text-sm font-semibold text-muted-foreground">
            {t("product_name")}
          </label>
          <Controller
            name={`items.${index}.product`}
            control={control}
            rules={{ required: t("product_name_required") }}
            render={({ field }) => (
              <Select
                {...field}
                options={productOptions}
                onChange={(option) => handleProductChange(option, index)}
                placeholder={t("select_product")}
                isClearable
                value={field.value ? productOptions.find((p) => p.value.id == field.value) : null}
                className="w-full react-select-container z-100"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    borderColor: errors.items?.[index]?.product ? "red" : "var(--border)",
                    borderWidth: "2px",
                    backgroundColor: "transparent",
                    padding: "2px",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: errors.items?.[index]?.product ? "red" : "rgb(16 185 129)",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    zIndex: 100,
                  }),
                }}
              />
            )}
          />
          {errors.items?.[index]?.product && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              {errors.items[index].product.message}
            </p>
          )}
        </div>

        {/* Unit Price */}
        <div className="space-y-1.5">
          <label htmlFor={`unitPrice-${index}`} className="block text-sm font-semibold text-muted-foreground">
            {t("unit_price")}
          </label>
          <Controller
            name={`items.${index}.unitPrice`}
            control={control}
            rules={{ required: t("unit_price_required") }}
            render={({ field }) => (
              <Input
                {...field}
                type="number" onWheel={(event) => event.currentTarget.blur()}
                id={`unitPrice-${index}`}
              />
            )}
          />
          {errors.items?.[index]?.unitPrice && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              {errors.items[index].unitPrice.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor={`quantity-${index}`} className="block text-sm font-semibold text-muted-foreground">
              {t("quantity")}
            </label>
            {productId && (
              <span
                className={`text-xs font-bold tracking-widest ${
                  watchedStock > 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                Stock available: {watchedStock}
              </span>
            )}
          </div>
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            rules={{
              required: t("quantity_required"),
              min: { value: 1, message: t("quantity_must_greater_zero") },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number" onWheel={(event) => event.currentTarget.blur()}
                id={`quantity-${index}`}
                className={`w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.items?.[index]?.quantity ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                }`}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          />
          {errors.items?.[index]?.quantity && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              {errors.items?.[index]?.quantity.message}
            </p>
          )}
        </div>

        {/* Total Price */}
        <div className="space-y-1.5">
          <label htmlFor={`totalPrice-${index}`} className="block text-sm font-semibold text-muted-foreground">
            {t("total_price")}
          </label>
          <Input
            type="text"
            id={`totalPrice-${index}`}
            value={formatCurrency(total)}
            disabled
            className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Service Charge */}
        <div className="space-y-1.5">
          <label htmlFor={`product_service_charge-${index}`} className="block text-sm font-semibold text-muted-foreground">
            Product Service Charge
          </label>
          <Controller
            name={`items.${index}.service_charge`}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number" onWheel={(event) => event.currentTarget.blur()}
                id={`product_service_charge-${index}`}
                step="0.01"
                className="w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-700"
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? "" : parseFloat(value));
                }}
                value={field.value === "" ? "" : field.value}
                placeholder="0.00"
              />
            )}
          />
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end pt-2">
        {fieldsLength > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => remove(index)}
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
          >
            <Trash className="mr-2 h-4 w-4" /> {t("remove")}
          </Button>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
const AddCustomerPerformaModal: React.FC<AddCustomerPerformaModalProps> = ({
  isOpen = true,
  onClose,
  selectedCustomerPerforma,
  setIsAddPerformaModalOpen,
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      shanci_kutir: "",
      targa_kutir: "",
      items: [
        {
          product: "",
          product_name: "",
          part_number: "",
          unit: "",
          quantity: 1,
          unitPrice: "",
          service_charge: "",
          performa_service_charge: "",
          stock: 0,
        },
      ],
      selectedReceipt: "Receipt",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const selectedPerformaId = selectedCustomerPerforma.id;
  const productOptions = getProductOptions(products);

  const { data: selectedPerforma, isLoading: isLoadingPerformas } = useQuery({
    queryKey: ["performaCustomersId", selectedPerformaId],
    queryFn: () => axiosInstance.get(`api/garage/performa-customers/${selectedPerformaId}`).then((res) => res.data),
    refetchOnWindowFocus: true,
    refetchInterval: 1500,
  });

  const queryClient = useQueryClient();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceOld.get(`${API_ENDPOINTS.PRODUCTS}?include_all=True`);
        setProducts(
          response?.data?.all_results?.map((product) => ({
            id: product.id,
            name: product.name,
            part_number: product.part_number,
            unit: product.unit,
            selling_price: product.selling_price,
            buying_price: product.buying_price,
            stock: product.stock || 0,
          })) || []
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle form submission
  const onSubmit = (data: { shanci_kutir: string; targa_kutir: string; items: Item[] }) => {
    setIsSubmitting(true);
    let hasError = false;

    data.items.forEach((item) => {
      if (!item.product) {
        hasError = true;
      }
    });

    if (hasError) {
      setIsSubmitting(false);
      toast.error("Please select a product for all items");
      return;
    }

    const performaData: PerformaData = {
      receipt: "Receipt",
      shanci_kutir: data.shanci_kutir,
      targa_kutir: data.targa_kutir,
      service_charge: data.items[0].performa_service_charge
        ? Number(data.items[0].performa_service_charge).toFixed(2)
        : "0.00",
      products: data.items.map((item) => {
        const selectedProduct = products.find((p) => p.id == item.product);
        return {
          product: item.product,
          product_name: selectedProduct?.name || "",
          part_number: item.part_number || selectedProduct?.part_number || "",
          unit: item.unit,
          quantity: item.quantity,
          unit_price: selectedProduct?.selling_price || item.unitPrice,
          product_service_charge: item.service_charge ? Number(item.service_charge).toFixed(2) : "0.00",
          service_price: item.service_charge ? Number(item.service_charge).toFixed(2) : "0.00",
        };
      }),
    };

    const updatedData = {
      ...selectedPerforma,
      performas: [...(selectedPerforma?.performas.results || []), performaData],
    };

    updatePerformaMutation.mutate(updatedData);
  };

  // Mutation for updating performa
  const updatePerformaMutation = useMutation({
    mutationFn: (updatedData: any) =>
      axiosInstance.patch(`api/garage/performa-customers/${selectedPerformaId}`, updatedData),
    onSuccess: () => {
      toast.success("Performa updated successfully!");
      queryClient.invalidateQueries(["performaCustomersId"]);
      setIsSubmitting(false);
      setIsAddPerformaModalOpen(false);
      setValue("shanci_kutir", "");
      setValue("targa_kutir", "");
      setValue("items", [
        {
          product: "",
          product_name: "",
          part_number: "",
          unit: "",
          quantity: 1,
          unitPrice: "",
          service_charge: "",
          performa_service_charge: "",
          stock: 0,
        },
      ]);
    },
    onError: (error: any) => {
      console.error("Error updating performa:", error);
      toast.error("Failed to update performa!");
      setIsSubmitting(false);
    },
  });

  // Add more items
  const handleAddMore = () => {
    append({
      product: "",
      product_name: "",
      part_number: "",
      unit: "",
      quantity: 1,
      unitPrice: "",
      service_charge: "",
      performa_service_charge: "",
      stock: 0,
    });
  };

  // Modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Product change handler
  const handleProductChange = (option: any, index: number) => {
    const selectedProduct = option?.value || null;
    if (selectedProduct) {
      setValue(`items.${index}.product`, selectedProduct.id);
      setValue(`items.${index}.product_name`, selectedProduct.name || "");
      setValue(`items.${index}.part_number`, selectedProduct.part_number || "");
      setValue(`items.${index}.unitPrice`, selectedProduct.selling_price || "");
      setValue(`items.${index}.stock`, selectedProduct.stock || 0);
      const productUnit = selectedProduct.unit || "";
      const matchingUnitOption = unitOptions.find(
        (opt) => opt.value.toLowerCase() === productUnit.toLowerCase()
      );
      setValue(`items.${index}.unit`, matchingUnitOption?.value || productUnit);
    } else {
      setValue(`items.${index}.product`, "");
      setValue(`items.${index}.product_name`, "");
      setValue(`items.${index}.part_number`, "");
      setValue(`items.${index}.unit`, "");
      setValue(`items.${index}.unitPrice`, "");
      setValue(`items.${index}.stock`, 0);
    }
  };

  // Scroll to last item
  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fields]);

  // --- Item Modal Component ---
  const ItemModal = ({
    isOpen,
    onClose,
    onAdd,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Item) => void;
  }) => {
    const [item, setItem] = useState<Item>({
      product: "",
      product_name: "",
      part_number: "",
      unit: "",
      quantity: 1,
      unitPrice: "",
      stock: 0,
    });

    const handleChange = (field: keyof Item, value: string | number) => {
      setItem((prevItem) => ({ ...prevItem, [field]: value } as Item));
    };

    const handleSubmit = () => {
      onAdd(item);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
          <h2 className="text-lg font-semibold mb-4">{t("add_item")}</h2>
          <div className="space-y-4">
            {/* Product Selector in Modal */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                {t("product_name")}
              </label>
              <Select
                options={productOptions}
                onChange={(option) => {
                  const selectedProduct = option?.value || null;
                  handleChange("product", selectedProduct?.id || "");
                  handleChange("product_name", selectedProduct?.name || "");
                  if (selectedProduct) {
                    handleChange("part_number", selectedProduct.part_number || "");
                    handleChange("unitPrice", selectedProduct.selling_price || "");
                    handleChange("stock", selectedProduct.stock || 0);
                    const productUnit = selectedProduct.unit || "";
                    const matchingUnitOption = unitOptions.find(
                      (opt) => opt.value.toLowerCase() === productUnit.toLowerCase()
                    );
                    handleChange("unit", matchingUnitOption?.value || productUnit);
                  }
                }}
                placeholder={t("select_product")}
                isClearable
                value={item.product ? productOptions.find((p) => p.value.id == item.product) : null}
              />
            </div>

            {/* Unit in Modal */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                {t("unit")}
              </label>
              <Select
                isClearable
                isSearchable
                options={unitOptions}
                value={item.unit ? { value: item.unit, label: item.unit } : null}
                onChange={(newValue) => handleChange("unit", newValue ? newValue.value : "")}
                isDisabled={true}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "var(--muted)/50",
                    cursor: "not-allowed",
                    opacity: 0.6,
                  }),
                }}
              />
            </div>

            {/* Quantity in Modal */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                {t("quantity")}
              </label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                id="quantity"
                value={item.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value, 10))}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Unit Price in Modal */}
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                {t("unit_price")}
              </label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                id="unitPrice"
                value={item.unitPrice}
                className="p-3 w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg"
            >
              <Plus className="mr-2" /> {t("add")}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-black text-white py-2 px-4 rounded-lg"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- Render ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-[60]">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            {t("add_performa")}
          </h2>
          <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {fields.length} {t("item") || "items"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="h-[55vh] overflow-auto pr-2 space-y-6">
            {/* Shanci and Targa Inputs */}
            <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="shanci_kutir" className="block text-sm font-semibold text-muted-foreground">
                    {t("shanci_kutir")}
                  </label>
                  <Controller
                    name="shanci_kutir"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="shanci_kutir"
                        className="w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-700"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="targa_kutir" className="block text-sm font-semibold text-muted-foreground">
                    {t("targa_kutir")}
                  </label>
                  <Controller
                    name="targa_kutir"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="targa_kutir"
                        className="w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-700"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Items List */}
            {fields.map((item, index) => (
              <ItemRow
                key={item.id}
                index={index}
                item={item}
                control={control}
                errors={errors}
                fieldsLength={fields.length}
                lastItemRef={lastItemRef}
                itemRefs={itemRefs}
                productOptions={productOptions}
                handleProductChange={handleProductChange}
                remove={remove}
                t={t}
              />
            ))}

            {/* Performa Service Charge */}
            <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl shadow-sm">
              <div className="space-y-1.5 md:w-1/2">
                <label htmlFor="performa_service_charge" className="block text-sm font-semibold text-muted-foreground">
                  Service Charge
                </label>
                <Controller
                  name="items.0.performa_service_charge"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number" onWheel={(event) => event.currentTarget.blur()}
                      id="performa_service_charge"
                      step="0.01"
                      className="w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-700"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseFloat(value));
                      }}
                      value={field.value === "" ? "" : field.value}
                      placeholder="0.00"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
                onClick={() => {
                  if (onClose) onClose();
                  setIsAddPerformaModalOpen(false);
                }}
                variant="outline"
                className="flex-1 sm:flex-none rounded-lg font-medium transition-colors border-muted hover:bg-muted/50"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Item Modal */}
        <ItemModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={(item) => {
            append(item);
            handleCloseModal();
          }}
        />
      </div>
    </div>
  );
};

export default AddCustomerPerformaModal;
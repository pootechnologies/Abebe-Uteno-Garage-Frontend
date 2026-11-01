import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, FileText, LayoutList, ArrowLeft } from "lucide-react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import usePerformaStore from "@/stores/usePerformaStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import axiosInstanceOld from "@/api/axiosOld";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  formatCurrency,
  calculateSubtotal,
  calculateVAT,
  calculateTotal,
} from "@/utils/performaUtils";

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

// --- Constants ---
const unitOptions = [
  { value: "PCS", label: "PCS" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Liter", label: "Liter" },
  { value: "pcs", label: "pcs" },
];

// --- Main Component ---
const AddCustomerPerformaPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomerPerforma = usePerformaStore(
    (state) => state.selectedCustomerPerforma
  );
  const selectedPerformaId = selectedCustomerPerforma?.id;

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
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const productOptions = getProductOptions(products);
  const items = watch("items");

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
      navigate("/performa-detail");
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


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Summary Sheet — fixed side trigger */}
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
                  <FileText className="h-4 w-4" />
                </div>
                Performa Summary
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="h-[50vh] overflow-y-auto space-y-3">
                {items
                  .filter((item) => item.product && item.quantity > 0)
                  .map((item, index) => {
                    const selectedProduct = products.find((p) => p.id == item.product);
                    const productName = selectedProduct?.name || item.product_name || "";
                    const partNumber = selectedProduct?.part_number || item.part_number || "";
                    const unitPrice = parseFloat(item.unitPrice) || 0;
                    return (
                      <div
                        key={index}
                        className="w-full p-3 bg-muted/20 border border-muted rounded-xl transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {productName} - {partNumber}
                            </p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(unitPrice)}
                            </p>
                            <p className="text-sm font-bold text-emerald-600">
                              {formatCurrency(item.quantity * unitPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 space-y-2 border-t border-muted pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("number_of_items")}</span>
                  <span className="font-semibold text-foreground">
                    {items.filter((item) => item.product && item.quantity > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("sub_total")}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(calculateSubtotal(items.map(i => ({ quantity: i.quantity, unitPrice: parseFloat(i.unitPrice) || 0 }))))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("vat")}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(calculateVAT(items.map(i => ({ quantity: i.quantity, unitPrice: parseFloat(i.unitPrice) || 0 }))))}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-600 border-t border-muted pt-3">
                  <span>{t("total_amount")}</span>
                  <span>{formatCurrency(calculateTotal(items.map(i => ({ quantity: i.quantity, unitPrice: parseFloat(i.unitPrice) || 0 })), "Receipt"))}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              {t("add_performa")}
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-xl border-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Vehicle Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  {t("vehicle_info") || "Vehicle Info"}
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 bg-muted/20 border border-muted/50 rounded-2xl">
                <div>
                  <label
                    htmlFor="shanci_kutir"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                  >
                    {t("shanci_kutir")}
                  </label>
                  <Controller
                    name="shanci_kutir"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="shanci_kutir"
                        className="h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                      />
                    )}
                  />
                </div>
                <div>
                  <label
                    htmlFor="targa_kutir"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                  >
                    {t("targa_kutir")}
                  </label>
                  <Controller
                    name="targa_kutir"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="targa_kutir"
                        className="h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                      />
                    )}
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
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    ref={
                      index === fields.length - 1
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
                      {/* Product Selector */}
                      <div>
                        <label
                          htmlFor={`product-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                        >
                          {t("product")}
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
                              value={items[index].product ? productOptions.find((p) => p.value.id == items[index].product) : null}
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  borderRadius: "0.75rem",
                                  borderColor: errors.items?.[index]?.product ? "#ef4444" : "var(--border)",
                                  backgroundColor: "white",
                                  "&:hover": { borderColor: "var(--primary)" },
                                }),
                                menu: (base) => ({ ...base, borderRadius: "0.75rem", overflow: "hidden" }),
                              }}
                            />
                          )}
                        />
                        {errors.items?.[index]?.product && (
                          <p className="mt-1 text-xs text-red-600">{errors.items?.[index]?.product?.message}</p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label
                          htmlFor={`unitPrice-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                        >
                          {t("unit_price")}
                        </label>
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={control}
                          rules={{
                            required: t("unit_price_required"),
                            validate: (value) =>
                              (value !== "" && value > 0) || t("unit_price_must_greater_zero"),
                          }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number" onWheel={(event) => event.currentTarget.blur()}
                              id={`unitPrice-${index}`}
                              step="0.01"
                              className={`h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 transition-all ${errors.items?.[index]?.unitPrice ? "border-red-500" : ""
                                }`}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              value={field.value === "" ? "" : field.value}
                            />
                          )}
                        />
                        {errors.items?.[index]?.unitPrice && (
                          <p className="mt-1 text-xs text-red-600">{errors.items?.[index]?.unitPrice?.message}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label
                            htmlFor={`quantity-${index}`}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                          >
                            {t("quantity")}
                          </label>
                          {items[index].product && (
                            <span
                              className={`text-xs font-bold tracking-widest ${items[index].stock > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                                }`}
                            >
                              Stock available: {items[index].stock}
                            </span>
                          )}
                        </div>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number" onWheel={(event) => event.currentTarget.blur()}
                              id={`quantity-${index}`}
                              className="h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 transition-all"
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                            />
                          )}
                        />
                      </div>

                      {/* Total Price */}
                      <div>
                        <label
                          htmlFor={`totalPrice-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                        >
                          {t("total_price")}
                        </label>
                        <Input
                          type="text"
                          id={`totalPrice-${index}`}
                          value={
                            items[index].quantity && items[index].unitPrice !== ""
                              ? formatCurrency(items[index].quantity * items[index].unitPrice)
                              : ""
                          }
                          disabled
                        />
                      </div>

                      {/* Service Charge */}
                      <div>
                        <label
                          htmlFor={`product_service_charge-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                        >
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
                              className="h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 transition-all"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              value={field.value === "" ? "" : field.value}
                              placeholder="0.00"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      {fields.length > 1 && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
                          type="button"
                          onClick={() => remove(index)}
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
                  onClick={handleAddMore}
                  variant="outline"
                  className="w-auto gap-2 rounded-xl border-dashed border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_more")}
                </Button>
              </div>
            </div>

            {/* Service Charge Section */}
            <div className="p-5 bg-muted/20 border border-muted/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <label
                  htmlFor="performa_service_charge"
                  className="text-sm font-bold uppercase tracking-wider text-emerald-600"
                >
                  Service Charge
                </label>
              </div>
              <Controller
                name="items.0.performa_service_charge"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    id="performa_service_charge"
                    step="0.01"
                    className="h-11 rounded-xl bg-white dark:bg-gray-800 border-muted-foreground/20 focus:border-emerald-500/50 transition-all max-w-sm"
                    placeholder="0.00"
                  />
                )}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[140px]"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerPerformaPage;

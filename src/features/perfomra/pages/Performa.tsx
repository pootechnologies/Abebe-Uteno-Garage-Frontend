import React, { useEffect, useState, useRef } from "react";
import { Trash, LayoutList, FileText, Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import toast from "react-hot-toast";
import { PDFViewer } from "@react-pdf/renderer";
import { t } from "i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PerformaPDF } from "../components/PerformaPDF";
import {
  fetchCompanyData,
  fetchCustomers,
  addCustomer,
  submitPerforma,
} from "../api/performa";
import {
  formatCurrency,
  calculateSubtotal,
  calculateVAT,
  calculateTotal,
  areAllItemsValid,
} from "@/utils/performaUtils";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { CustomerModal } from "../components/CustomerModal";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstanceOld from "@/api/axiosOld";

interface Product {
  value: number;
  label: string;
  unit: string;
  buying_price: number;
  selling_price: number;
  part_number: string;
  stock: number;
}

interface Item {
  productId: number;
  product: string;
  part_number: string;
  shanci_kutir: string;
  targa_kutir: string;
  unit: string;
  quantity: number;
  unitPrice: number | "";
  service_charge?: number | "";
  performa_service_charge?: number | "";
  stock: number;
  productOption?: any;
}
interface Customer {
  id: number;
  name: string;
  phone: string;
  tin_number: string;
  fs_number: string;
  organization: string;
}
interface Company {
  name: string;
  am_name: string;
  phone1: string;
  phone2: string;
  tin_number: string;
  logo: string;
}
interface NewCustomer {
  name: string;
  phone: string;
  tin_number: string;
  vat_number: string;
  zone: string;
  city: string;
  sub_city: string;
}

const unitOptions = [
  { value: "Pcs", label: "Pcs" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Letter", label: "Letter" },
];

const getProductOptions = (products: Product[]) => {
  return products.map((product) => ({
    value: product,
    label: `${product.label} - ${product.part_number ?? "N/A"}`,
  }));
};

const Performa: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyData, setCompanyData] = useState<Company>({
    name: "",
    am_name: "",
    phone1: "",
    phone2: "",
    tin_number: "",
    logo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [performaIdFourDigit, setPerformaIdFourDigit] = useState<number | null>(
    null,
  );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const productOptions = getProductOptions(products);
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      items: [
        {
          productId: 0,
          product: "",
          part_number: "",
          shanci_kutir: "",
          targa_kutir: "",
          unit: "",
          quantity: 1,
          unitPrice: "",
          service_charge: "",
          performa_service_charge: "",
          stock: 0,
          productOption: null,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const items = watch("items");

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);



  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [company, customers] = await Promise.all([
          fetchCompanyData(),
          fetchCustomers(),
        ]);
        setCompanyData(company);
        setCustomers(customers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await axiosInstanceOld.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`,
        );
        setProducts(
          response?.data?.all_results?.map((product) => ({
            value: product.id,
            label: product.name,
            unit: product.unit,
            buying_price: product.buying_price,
            selling_price: product.selling_price,
            part_number: product.part_number || "",
            stock: product.stock || 0,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCustomerChange = (
    selectedOption: { value: Customer; label: string } | null,
  ) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleProductChange = (option: any, index: number) => {
    const selectedProduct = option?.value || null;

    if (selectedProduct) {
      setValue(`items.${index}.product`, selectedProduct.label);
      setValue(`items.${index}.part_number`, selectedProduct.part_number);
      setValue(`items.${index}.productId`, selectedProduct.value);
      setValue(`items.${index}.unitPrice`, selectedProduct.selling_price.toString());
      setValue(`items.${index}.unit`, selectedProduct.unit);
      setValue(`items.${index}.stock`, selectedProduct.stock);
      setValue(`items.${index}.productOption`, option);
    } else {
      setValue(`items.${index}.product`, "");
      setValue(`items.${index}.part_number`, "");
      setValue(`items.${index}.productId`, 0);
      setValue(`items.${index}.unitPrice`, "");
      setValue(`items.${index}.unit`, "");
      setValue(`items.${index}.stock`, 0);
      setValue(`items.${index}.productOption`, null);
    }
  };

  const onSubmit = async () => {
    if (!areAllItemsValid(items) || calculateTotal(items, "Receipt") === 0)
      return;
    setIsSubmitting(true);
    try {
      const performaData = {
        customer: selectedCustomer ? selectedCustomer.id : null,
        performas: [
          {
            receipt: "Receipt",
            shanci_kutir: items[0].shanci_kutir,
            targa_kutir: items[0].targa_kutir,
            service_charge: items[0].performa_service_charge ? Number(items[0].performa_service_charge).toFixed(2) : "0.00",
            products: items.map((item) => ({
              product: item.productId || null,
              part_number: item.part_number,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: Number(item.unitPrice || 0).toFixed(2),
              product_service_charge: item.service_charge ? Number(item.service_charge).toFixed(2) : "0.00",
              service_price: item.service_charge ? Number(item.service_charge).toFixed(2) : "0.00",
            })),
          },
        ],
      };
      const id = await submitPerforma(performaData);
      setPerformaIdFourDigit(id);
      // Comment out the PDF modal opening logic
      // if (windowWidth >= 768) {
      //   setShowPDFModal(true);
      // } else {
      // toast.success("Performa submitted successfully!");
      resetForm();
      // }
    } catch (error) {
      console.error("Error submitting performa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset({
      items: [
        {
          productId: 0,
          product: "",
          part_number: "",
          shanci_kutir: "",
          targa_kutir: "",
          unit: "",
          quantity: 1,
          unitPrice: "",
          service_charge: "",
          performa_service_charge: "",
          stock: 0,
          productOption: null,
        },
      ],
    });
    setSelectedCustomer(null);
  };

  const PDFModal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          {children}
        </div>
      </div>
    );
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
                  .map((item, index) => (
                    <div
                      key={index}
                      className="w-full p-3 bg-muted/20 border border-muted rounded-xl transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.product} - {item.part_number}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.unitPrice || 0)}
                          </p>
                          <p className="text-sm font-bold text-emerald-600">
                            {formatCurrency(item.quantity * (item.unitPrice || 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <span className="font-semibold text-foreground">{formatCurrency(calculateSubtotal(items))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{t("vat")}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(calculateVAT(items))}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald-600 border-t border-muted pt-3">
                  <span>{t("total_amount")}</span>
                  <span>{formatCurrency(calculateTotal(items, "Receipt"))}</span>
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
              <FileText className="h-6 w-6" />
            </div>
            {t("performa")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Customer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  {t("customer_name")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                  >
                    {t("customer_name")}
                  </label>
                  <Select
                    isClearable
                    id="customer-name"
                    options={customers.map((customer) => ({
                      label: customer.organization,
                      value: customer,
                    }))}
                    onChange={handleCustomerChange}
                    value={
                      selectedCustomer
                        ? {
                          label: selectedCustomer.organization,
                          value: selectedCustomer,
                        }
                        : null
                    }
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
                <div>
                  <Button
                    type="button"
                    onClick={openModal}
                    variant="outline"
                    className="gap-2 rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50 transition-all font-semibold"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t("add_customers")}
                  </Button>
                </div>
              </div>
            </div>

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
                    name="items.0.shanci_kutir"
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
                    name="items.0.targa_kutir"
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
                              placeholder={isLoadingProducts ? "Loading products..." : t("select_product")}
                              isClearable
                              isLoading={isLoadingProducts}
                              isDisabled={isLoadingProducts}
                              value={items[index].productOption || null}
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

                      {/* <div>
                        <label
                          htmlFor={`unit-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                        >
                          {t("unit")}
                        </label>
                        <Controller
                          name={`items.${index}.unit`}
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              isClearable
                              isSearchable
                              options={unitOptions}
                              value={value ? { value, label: value } : null}
                              onChange={(newValue) => onChange(newValue ? newValue.value : "")}
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  borderRadius: "0.75rem",
                                  borderColor: "var(--border)",
                                  backgroundColor: "white",
                                  "&:hover": { borderColor: "var(--primary)" },
                                }),
                                menu: (base) => ({ ...base, borderRadius: "0.75rem", overflow: "hidden" }),
                              }}
                            />
                          )}
                        />
                      </div> */}



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
                        // className="h-11 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold cursor-not-allowed"
                        />
                      </div>

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
                  variant="outline"
                  onClick={() =>
                    append({
                      productId: 0,
                      product: "",
                      part_number: "",
                      shanci_kutir: "",
                      targa_kutir: "",
                      unit: "",
                      quantity: 1,
                      unitPrice: "",
                      service_charge: "",
                      performa_service_charge: "",
                      stock: 0,
                      productOption: null,
                    })
                  }
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

            {/* Footer Actions */}
            <div className="flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[140px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : (
                  t("submit_performa")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <CustomerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={async (data: NewCustomer) => {
            try {
              await addCustomer(data);
              const updatedCustomers = await fetchCustomers();
              setCustomers(updatedCustomers);
              closeModal();
            } catch (error) {
              console.error("Error adding customer:", error);
            }
          }}
        />
      )}
      <PDFModal
        isOpen={showPDFModal}
        onClose={() => {
          setShowPDFModal(false);
          resetForm();
        }}
      >
        <PDFViewer width="100%" height="600">
          <PerformaPDF
            data={items}
            customer={selectedCustomer?.organization}
            companyData={companyData}
            receipt="Receipt"
            performaIdFourDigit={performaIdFourDigit}
          />
        </PDFViewer>
      </PDFModal>
    </div>
  );
};

export default Performa;

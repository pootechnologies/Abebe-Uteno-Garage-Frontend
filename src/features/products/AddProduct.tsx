import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Select from "react-select/creatable";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { Button } from "@/components/ui/button";
import { 
  Package,
  Hash,
  Tags,
  DollarSign,
  PackageOpen,
  Box,
  Warehouse,
  Scale,
  Truck,
  FileText,
  Plus
} from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import AddSupplierModal from "./AddSupplierModal";

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "44px",
    paddingLeft: "2rem",
    borderRadius: "0.75rem",
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "rgba(5, 150, 105, 0.5)" : "rgba(100, 116, 139, 0.2)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(5, 150, 105, 0.1)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    "&:hover": {
      borderColor: state.isFocused ? "rgba(5, 150, 105, 0.5)" : "rgba(100, 116, 139, 0.35)",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "rgba(16, 185, 129, 0.1)" : "transparent",
    color: state.isSelected ? "white" : "inherit",
    "&:active": { backgroundColor: "#059669" },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "inherit",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "rgba(100, 116, 139, 0.65)",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "inherit",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};
import { t } from "i18next";
import axiosInstanceOld from "@/api/axiosOld";
import parts from "../../products.json";

const unitOptions = [
  { value: "PCS", label: "PCS" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Liter", label: "Liter" },
];

// Extract unique product names and their part numbers
const getProductOptions = () => {
  const uniqueProducts = [...new Set(parts.map((part) => part.description))];
  return uniqueProducts.map((description) => ({
    value: description,
    label: description,
  }));
};

// Get part numbers for a selected product
const getPartNumbersForProduct = (productName) => {
  return parts
    .filter((part) => part.description === productName)
    .map((part) => ({
      value: part.part_no,
      label: part.part_no,
    }));
};

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState(null);
  const [partNumberOptions, setPartNumberOptions] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const productOptions = getProductOptions();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstanceOld.get(API_ENDPOINTS.CATEGORIES);
        setCategories(
          response.data?.map((category) => ({
            value: category.id,
            label: category.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories!");
      }
    };
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstanceOld.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data?.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Failed to fetch suppliers!");
      }
    };
    fetchCategories();
    fetchSuppliers();
  }, []);

  const validateForm = (data) => {
    const validationErrors = {};
    if (!data.name) {
      validationErrors.name = {
        type: "required",
        message: t("product_name_required"),
      };
    }
    if (data.selling_price === undefined || data.selling_price === null || data.selling_price === "") {
      validationErrors.selling_price = {
        type: "required",
        message: t("selling_price_required"),
      };
    } else if (data.selling_price < 0) {
      validationErrors.selling_price = {
        type: "min",
        message: t("selling_price_cannot_be_negative"),
      };
    }
    if (
      data.stock === undefined ||
      data.stock === null ||
      data.stock === "" ||
      Number.isNaN(data.stock)
    ) {
      validationErrors.stock = {
        type: "required",
        message: "Stock is required",
      };
    } else if (data.stock < 0) {
      validationErrors.stock = {
        type: "min",
        message: "Stock must be zero or greater",
      };
    }
    return validationErrors;
  };

  const onSubmit = async (data) => {
    const validationErrors = validateForm(data);
    clearErrors();
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([key, error]) => {
        setError(key, error);
      });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", selectedProduct?.label || data.name);
    formData.append("part_number", selectedPartNumber?.value || data.part_number);
    if (selectedCategory?.value) {
      formData.append("category", selectedCategory.value.toString());
    }
    formData.append("buying_price", data.buying_price || 0);
    formData.append("selling_price", data.selling_price);
    if (data.description) formData.append("description", data.description);
    if (selectedSupplier?.value) {
      formData.append("supplier", selectedSupplier.value.toString());
    }
    if (data.piece) formData.append("piece", data.piece);
    if (data.package) formData.append("package", data.package);
    formData.append("stock", String(data.stock));
    if (selectedUnit?.value) formData.append("unit", selectedUnit.value);
    try {
      const response = await axiosInstanceOld.post(
        API_ENDPOINTS.PRODUCTS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product added successfully!");
      reset();
      setSelectedCategory(null);
      setSelectedSupplier(null);
      setSelectedUnit(null);
      setSelectedProduct(null);
      setSelectedPartNumber(null);
      setPartNumberOptions([]);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.error || "Failed to add product!");
    } finally {
      setIsLoading(false);
    }
  };

  const openCategoryModal = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);
  const handleCategoryAdded = () => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstanceOld.get(API_ENDPOINTS.CATEGORIES);
        setCategories(
          response.data.map((category) => ({
            value: category.id,
            label: category.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories!");
      }
    };
    fetchCategories();
    closeCategoryModal();
  };

  const openSupplierModal = () => setIsSupplierModalOpen(true);
  const closeSupplierModal = () => setIsSupplierModalOpen(false);
  const handleSupplierAdded = () => {
    const fetchSuppliers = async () => {
      try {
        const response = await axiosInstanceOld.get(API_ENDPOINTS.SUPPLIERS);
        setSuppliers(
          response.data.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Failed to fetch suppliers!");
      }
    };
    fetchSuppliers();
    closeSupplierModal();
  };

  const handleProductChange = (option) => {
    setSelectedProduct(option);
    setValue("name", option?.label || "");
    if (option) {
      clearErrors("name");
    }
    if (option) {
      const partNumbers = getPartNumbersForProduct(option.label);
      setPartNumberOptions(partNumbers);
    } else {
      setPartNumberOptions([]);
    }
    setSelectedPartNumber(null);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Package className="h-6 w-6" />
            </div>
            {t("add_products")}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="product"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("product_name")}
              </label>
              <div className="relative group mt-2">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                <Select
                  id="product"
                  options={productOptions}
                  value={selectedProduct}
                  onChange={handleProductChange}
                  placeholder={t("select_product")}
                  isClearable
                  styles={customSelectStyles}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 ml-1">{String(errors.name.message)}</p>
              )}
            </div>

            {/* Part Number */}
            <div>
              <label
                htmlFor="part_number"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("part_number")}
              </label>
              <div className="relative group mt-2">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                <Select
                  id="part_number"
                  options={partNumberOptions}
                  value={selectedPartNumber}
                  onChange={(option) => {
                    setSelectedPartNumber(option);
                    setValue("part_number", option?.value || "");
                  }}
                  placeholder={t("select_part_number")}
                  isClearable
                  isDisabled={!selectedProduct}
                  styles={customSelectStyles}
                />
              </div>
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <div className="flex items-end gap-3 w-full">
                <div className="flex-1">
                  <label
                    htmlFor="category"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    {t("category")}
                  </label>
                  <div className="relative group mt-2">
                    <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                    <Select
                      id="category"
                      options={categories}
                      value={selectedCategory}
                      onChange={(option) => {
                        setSelectedCategory(option);
                        clearErrors("category");
                      }}
                      placeholder={t("select_category")}
                      isClearable
                      styles={customSelectStyles}
                    />
                  </div>
                </div>
                <Button type="button" onClick={openCategoryModal} className="h-11 px-4 rounded-xl border border-muted-foreground/20 bg-muted/20 text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all font-medium"
                >
                  {t("add_category")}
                </Button>
              </div>
            </div>

            {/* Buying Price */}
            <div>
              <label
                htmlFor="buying_price"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("buying_price")}
              </label>
              <div className="relative group mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="buying_price"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  {...register("buying_price", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Selling Price */}
            <div>
              <label
                htmlFor="selling_price"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("selling_price")}
              </label>
              <div className="relative group mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="selling_price"
                  className={`pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full ${
                    errors.selling_price ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  {...register("selling_price", {
                    valueAsNumber: true,
                    required: t("selling_price_required"),
                    validate: (value) => value >= 0 || t("selling_price_cannot_be_negative")
                  })}
                />
              </div>
              {errors.selling_price && (
                <p className="text-red-500 text-sm mt-1 ml-1">
                  {String(errors.selling_price.message)}
                </p>
              )}
            </div>

            {/* Piece */}
            <div>
              <label
                htmlFor="piece"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("piece")}
              </label>
              <div className="relative group mt-2">
                <PackageOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="piece"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  {...register("piece", { valueAsNumber: true })}
                />
              </div>
            </div> 

            {/* Package */}
            
            
             <div>
              <label
                htmlFor="package"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("package")}
              </label>
              <div className="relative group mt-2">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="package"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  {...register("package", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("stock")}
              </label>
              <div className="relative group mt-2">
                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  id="stock"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1 ml-1">{String(errors.stock.message)}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label
                htmlFor="unit"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("unit")}
              </label>
              <div className="relative group mt-2">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                <Select
                  id="unit"
                  options={unitOptions}
                  value={selectedUnit}
                  onChange={(option) => {
                    setSelectedUnit(option);
                    clearErrors("unit");
                  }}
                  placeholder={t("select_unit")}
                  isClearable
                  styles={customSelectStyles}
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="md:col-span-2">
              <div className="flex items-end gap-3 w-full">
                <div className="flex-1">
                  <label
                    htmlFor="supplier"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    {t("supplier")}
                  </label>
                  <div className="relative group mt-2">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                    <Select
                      id="supplier"
                      options={suppliers}
                      value={selectedSupplier}
                      onChange={(option) => {
                        setSelectedSupplier(option);
                        clearErrors("supplier");
                      }}
                      placeholder={t("select_supplier")}
                      isClearable
                      styles={customSelectStyles}
                    />
                  </div>
                </div>
                <Button type="button" onClick={openSupplierModal} className="h-11 px-4 rounded-xl border border-muted-foreground/20 bg-muted/20 text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all font-medium"
                >
                  {t("add_supplier")}
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("description")}
              </label>
              <div className="relative group mt-2">
                <FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  id="description"
                  rows={4}
                  className="pl-10 pt-3 h-auto bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  placeholder={t("description")}
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-muted">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("submitting")}
                </div>
              ) : t("submit_product")}
            </Button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        onCategoryAdded={handleCategoryAdded}
      />
      <AddSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={closeSupplierModal}
        onSupplierAdded={handleSupplierAdded}
      />
    </div>
  );
};

export default AddProduct;

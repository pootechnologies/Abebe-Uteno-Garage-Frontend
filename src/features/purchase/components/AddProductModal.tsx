import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { t } from "i18next";
import { Trash, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { Spinner } from "@/components/ui/spinner";

const AddProductModal = ({ isOpen, onClose, selectedProducts }) => {
    const normalizedSelectedProducts = Array.isArray(selectedProducts)
        ? selectedProducts
        : selectedProducts
            ? [selectedProducts]
            : [];
    const [formDataList, setFormDataList] = useState([
        {
            product: null,
            part_number: "",
            unit: "",
            description: "",
            quantity: "",
            unitPrice: 0,
        },
    ]);
    const [products, setProducts] = useState([]);
    const itemRefs = useRef([]);
    const lastItemRef = useRef(null);

    // Fetch products for the Select component
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstanceOld.get(
                    API_ENDPOINTS.PRODUCTS
                );
                setProducts(
                    response?.data?.results?.map((product) => ({
                        value: product.id,
                        label: product.name,
                        unit: product.unit,
                        buying_price: product.buying_price,
                        part_number: product.part_number,
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };
        fetchProducts();
    }, []);

    const { data: expenseDetailsList, isLoading: isLoadingExpenseDetails } =
        useQuery({
            queryKey: ["expenseDetailsList", selectedProducts.id],
            queryFn: () =>
                axiosInstanceOld
                    .get(
                        `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedProducts.id}`
                    )
                    .then((res) => res.data),
            enabled: !!selectedProducts.id && isOpen,
        });

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (updatedProducts) =>
            axiosInstanceOld.patch(
                `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedProducts.id}`,
                updatedProducts[0]
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
            queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
            queryClient.invalidateQueries({ queryKey: ["expenseDetailsList"] });
            toast.success("Products updated successfully!");
            resetForm();
            onClose();
        },
        onError: (error) => {
            toast.error("Failed to update products.");
            console.error("Error updating products:", error);
        },
    });

    const resetForm = () => {
        setFormDataList([
            {
                product: null,
                part_number: "",
                unit: "",
                description: "",
                quantity: "",
                unitPrice: 0,
            },
        ]);
    };

    const handleChange = (index, field, value) => {
        const newFormDataList = [...formDataList];
        if (field === "product") {
            newFormDataList[index][field] = value;
            newFormDataList[index].unit = value?.unit || "";
            newFormDataList[index].unitPrice = 0;
            newFormDataList[index].part_number = value?.part_number || "";
        } else {
            newFormDataList[index][field] = value;
        }
        setFormDataList(newFormDataList);
    };

    const handleAddMore = () => {
        setFormDataList([
            ...formDataList,
            {
                product: null,
                part_number: "",
                unit: "",
                description: "",
                quantity: "",
                unitPrice: 0,
            },
        ]);
    };

    const handleRemove = (index) => {
        const newFormDataList = [...formDataList];
        newFormDataList.splice(index, 1);
        setFormDataList(newFormDataList);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Validate form data
        const isValid = formDataList.every(item =>
            item.product && item.quantity && (item.unitPrice !== "" && item.unitPrice >= 0)
        );
        if (!isValid) {
            toast.error("Please fill in all required fields");
            return;
        }
        const updatedProducts = normalizedSelectedProducts.map(
            (selectedProduct) => {
                const newProducts = formDataList.map((formData) => ({
                    product: formData.product.value,
                    part_number: formData.part_number,
                    unit: formData.unit,
                    description: formData.description,
                    quantity: formData.quantity,
                    unit_price: parseFloat(formData.unitPrice) || 0,
                }));
                return {
                    ...expenseDetailsList,
                    products: [...expenseDetailsList.products, ...newProducts],
                };
            }
        );
        mutation.mutate(updatedProducts);
    };

    const calculateTotalPrice = (quantity, unitPrice) => {
        const quantityValue = parseFloat(quantity) || 0;
        const unitPriceValue = parseFloat(unitPrice) || 0;
        return (quantityValue * unitPriceValue).toFixed(2);
    };

    useEffect(() => {
        if (lastItemRef.current) {
            lastItemRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [formDataList]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-[60]">
            <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
                            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            {t("add_product")}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {formDataList.length} {t("product")}
                        </p>
                    </div>

                    {/* Items */}
                    <form onSubmit={handleSubmit}>
                        <div className="h-[60vh] overflow-auto pr-2 space-y-6">
                            {formDataList.map((formData, index) => (
                                <div
                                    key={index}
                                    ref={
                                        index === formDataList.length - 1
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
                                            id={`products-${index}`}
                                            options={products}
                                            value={formData.product}
                                            onChange={(selectedOption) =>
                                                handleChange(index, "product", selectedOption)
                                            }
                                            placeholder={t("select_product")}
                                            isClearable
                                            isSearchable
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
                                                    "&:hover": { borderColor: "rgb(16 185 129)" },
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    borderRadius: "0.5rem",
                                                    overflow: "hidden",
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>

                                    {/* Grid fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Part Number */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor={`part_number-${index}`}
                                                className="block text-sm font-semibold text-muted-foreground"
                                            >
                                                {t("part_number")}
                                            </label>
                                            <input
                                                type="text"
                                                id={`part_number-${index}`}
                                                value={formData.part_number}
                                                onChange={(e) => handleChange(index, "part_number", e.target.value)}
                                                disabled
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                            />
                                        </div>

                                        {/* Unit */}
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
                                                value={formData.unit}
                                                onChange={(e) => handleChange(index, "unit", e.target.value)}
                                                disabled
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor={`description-${index}`}
                                                className="block text-sm font-semibold text-muted-foreground"
                                            >
                                                {t("description")}
                                            </label>
                                            <input
                                                type="text"
                                                id={`description-${index}`}
                                                value={formData.description}
                                                onChange={(e) => handleChange(index, "description", e.target.value)}
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor={`quantity-${index}`}
                                                className="block text-sm font-semibold text-muted-foreground"
                                            >
                                                {t("quantity")}
                                            </label>
                                            <input
                                                type="number" onWheel={(event) => event.currentTarget.blur()}
                                                id={`quantity-${index}`}
                                                min="1"
                                                required
                                                value={formData.quantity}
                                                onChange={(e) => handleChange(index, "quantity", e.target.value)}
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>

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
                                                required
                                                value={formData.unitPrice}
                                                onChange={(e) => handleChange(index, "unitPrice", e.target.value)}
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
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
                                                value={calculateTotalPrice(formData.quantity, formData.unitPrice)}
                                                disabled
                                                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Remove button */}
                                    <div className="flex justify-end pt-2">
                                        {formDataList.length > 1 && (
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
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Spinner className="w-4 h-4 mr-2" />
                                            {t("submitting..")}
                                        </>
                                    ) : (
                                        t("submit")
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;



import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";

const UpdateExpenseProductModal = ({
    isUpdateProductModalOpen,
    setIsUpdateProductModalOpen,
    selectedProduct,
    setSelectedProduct,
    formatCurrency,
}) => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateProduct = async () => {
        setIsUpdating(true);
        try {
            const accessToken = localStorage.getItem("token");
            await axios.patch(
                `${API_BASE_URL}${API_ENDPOINTS.PURCHASE_PRODUCTS}${selectedProduct.id}`,
                selectedProduct,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            toast.success("Product updated successfully!");
            setIsUpdateProductModalOpen(false);
            await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
            await queryClient.invalidateQueries({ queryKey: ["ExpenseProducts"] });
        } catch (err) {
            toast.error("Failed to update product!");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isUpdateProductModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-20">
            <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3 mb-4">
                    {t("update_product")}
                </h2>

                {selectedProduct && (
                    <>
                        <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 shadow-sm">
                            {/* Product Name */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("product")}
                                </label>
                                <input
                                    type="text"
                                    value={selectedProduct.product_name}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            product_name: e.target.value,
                                        })
                                    }
                                    disabled
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                />
                            </div>

                            {/* Part Number */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("part_number")}
                                </label>
                                <input
                                    type="text"
                                    value={selectedProduct.part_number || ""}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            part_number: e.target.value,
                                        })
                                    }
                                    disabled
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                />
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("unit")}
                                </label>
                                <input
                                    type="text"
                                    value={selectedProduct.unit}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            unit: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("description")}
                                </label>
                                <input
                                    type="text"
                                    value={selectedProduct.description}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Unit Price */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("unit_price")}
                                </label>
                                <input
                                    type="number" onWheel={(event) => event.currentTarget.blur()}
                                    step="0.01"
                                    value={selectedProduct.unit_price}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            unit_price: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("quantity")}
                                </label>
                                <input
                                    type="number" onWheel={(event) => event.currentTarget.blur()}
                                    min="1"
                                    value={selectedProduct.quantity}
                                    onChange={(e) =>
                                        setSelectedProduct({
                                            ...selectedProduct,
                                            quantity: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Total Price */}
                            <div className="sm:col-span-2">
                                <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                                    {t("total_price")}
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={formatCurrency(
                                        selectedProduct.quantity * selectedProduct.unit_price
                                    )}
                                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-muted/20 text-muted-foreground focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-lg font-medium transition-colors"
                                onClick={() => setIsUpdateProductModalOpen(false)}
                            >
                                {t("cancel")}
                            </Button>
                            <button
                                type="button"
                                onClick={handleUpdateProduct}
                                disabled={isUpdating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdating && <Spinner className="w-4 h-4" />}
                                {isUpdating ? t("updating") : t("update")}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdateExpenseProductModal;

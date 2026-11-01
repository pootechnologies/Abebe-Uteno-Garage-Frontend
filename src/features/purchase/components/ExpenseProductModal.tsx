import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { t } from "i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ShoppingBag,
  Hash,
  Tag,
  Box,
  Scale,
  Layers,
  DollarSign,
  Calculator,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const ExpenseProductModal = ({
  modalOpenExpense,
  setModalOpenExpense,
  setIsAddProductModalOpen,
  productColumns,
  selectedProducts,
  handleView,
  handleDeleteProduct,
}) => {
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 5; // You can adjust this value as needed
  const selectedExpenseId = selectedProducts?.id;
  const selectedProductStatus = selectedProducts?.payment_status;

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete === null) return;
    setIsDeleting(true);
    try {
      await handleDeleteProduct(productToDelete);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // Fetch expense products
  const { data, error, isLoading } = useQuery({
    queryKey: ["ExpenseProducts", selectedExpenseId],
    queryFn: fetchExpenseProducts,
    enabled: !!selectedExpenseId,
  });

  async function fetchExpenseProducts() {
    const response = await axiosInstanceOld.get(
      `${API_ENDPOINTS.PURCHASE_EXPENSES}${selectedExpenseId}`,
    );
    return response.data;
  }

  // Calculate the total number of pages
  const productPageCount = Math.ceil(
    (data?.products?.length || 0) / itemsPerPage,
  );

  // Handle page change
  const handleProductsPageChange = (event, page) => {
    setCurrentProductsPage(page);
  };

  // Sort products by id in descending order and then slice for pagination
  const sortedProducts = [...(data?.products || [])].sort(
    (a, b) => b.id - a.id,
  );
  const currentPageProducts = sortedProducts.slice(
    (currentProductsPage - 1) * itemsPerPage,
    currentProductsPage * itemsPerPage,
  );

  if (!modalOpenExpense) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-10">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-5xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ShoppingBag className="h-6 w-6" />
            </div>
            {t("products")}
          </h2>
          <Button
            onClick={() => setIsAddProductModalOpen(true)}
            disabled={selectedProductStatus === "Paid"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50"
          >
            {t("add_product")}
          </Button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="large" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-6 font-medium">
            Failed to load products.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40">
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                        {t("id")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {t("products")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Box className="h-3.5 w-3.5 text-primary" />
                        {t("part_number")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        {t("unit")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {t("description")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("unit_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        {t("quantity")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-3.5 w-3.5 text-primary" />
                        {t("total_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground font-medium">
                        {t("no_data_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPageProducts.map((product) => (
                      <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-medium">#{product.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{product.product_name || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{product.part_number || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{product.unit}</TableCell>
                        <TableCell className="text-muted-foreground">{product.description || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{product.unit_price}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{product.quantity}</TableCell>
                        <TableCell className="font-semibold">{product.total_price}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-xl border-muted">
                              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                                {t("actions")}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleView(product)}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Pencil className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-sm">{t("update_product")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(product.id)}
                                className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="font-bold text-sm">{t("delete")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-muted mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentProductsPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentProductsPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2 text-sm font-medium">
                  {currentProductsPage} / {productPageCount || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentProductsPage((prev) => Math.min(prev + 1, productPageCount))}
                  disabled={currentProductsPage === productPageCount || productPageCount === 0}
                  className="gap-2 rounded-lg"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-muted">
          <Button
            variant="outline"
            onClick={() => setModalOpenExpense(false)}
          >
            {t("close")}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={productToDelete !== null}
        onOpenChange={(open) => { if (!open) setProductToDelete(null); }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-[1001]">
          <div className="bg-destructive/5 px-6 py-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-destructive/10 text-destructive rounded-full shadow-inner animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive">
                {t("are_you_sure")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground font-medium px-4 leading-relaxed">
              {t("sure_discription_product")}
            </p>
          </div>
          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setProductToDelete(null)}
              className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-destructive/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseProductModal;

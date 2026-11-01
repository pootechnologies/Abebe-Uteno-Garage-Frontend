import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreVertical, Eye, Pencil, Trash2, Hash, ShoppingBag, Layers, DollarSign, BadgeCheck, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.js";
import useUserStore from "@/stores/useUserStore";

const fetchOrderDetails = async (selectedOrderId) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `${API_BASE_URL}${API_ENDPOINTS.ORDERS}${selectedOrderId}`,
    { headers }
  );
  return response.data;
};

const OrderDetailModal = ({
  isOpen,
  onClose,
  modalItemsPerPage,
  modalPageCount,
  modalCurrentPage,
  handleModalPageChange,
  showDeleteModal,
  setShowDeleteModal,
  handleConfirmDelete,
  handleAddOrderClick,
  showItemDetails,
  setEditProduct,
  handleDeleteSubmit,
  t,
  selectedOrderId,
}) => {
  // Always call hooks, even if modal isn't open
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderDetails", selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId),
    enabled: !!selectedOrderId && isOpen,
  });

  const user = useUserStore((state) => state.user);
  const isCashier = user?.role === "Cashier";
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await handleConfirmDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  // If modal is closed, don't render content (but hooks already ran)
  if (!isOpen) return null;

  // if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching order details</div>;

  // Sort items by ID in descending order
  const sortedData = [...(data?.data?.items || [])].sort((a, b) => b.id - a.id);

  // Pagination logic
  const startIndex = (modalCurrentPage - 1) * modalItemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + modalItemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-10">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-5xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-4 mb-6">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
            <ShoppingBag className="h-6 w-6" />
          </div>
          {t("order_details")}
        </h2>

        <div className="flex justify-end mb-6">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
            onClick={handleAddOrderClick}
          >
            {t("add_orders")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="large" />
          </div>
        ) : (
          <>
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
                        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                        {t("product_name")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                        {t("part_number")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        {t("package")}
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
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("item_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("total_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        {t("status")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => {
                    return (
                      <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-medium">#{item.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{item.product_name || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{item.part_number || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{item.package || 0}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">
                          {formatCurrency(
                            item.unit_price ? item.unit_price : item.product_price
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {formatCurrency(
                            item.total_price ? item.total_price : item.price
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === "Done"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : item.status === "Pending"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-xl border-muted">
                              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-muted" />
                              
                              <DropdownMenuItem
                                onClick={() => showItemDetails(item)}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-sm">{t("view")}</span>
                              </DropdownMenuItem>

                              {!isCashier && (
                                <DropdownMenuItem
                                  onClick={() => setEditProduct(item)}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <Pencil className="h-4 w-4 text-yellow-600" />
                                  <span className="font-medium text-sm">{t("update")}</span>
                                </DropdownMenuItem>
                              )}

                              {!isCashier && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSubmit(item.id)}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                  <span className="font-medium text-sm">{t("delete")}</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-muted mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalPageChange(null, modalCurrentPage - 1)}
                  disabled={modalCurrentPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2 text-sm font-medium">
                 {modalCurrentPage} / {Math.ceil(sortedData.length / modalItemsPerPage) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalPageChange(null, modalCurrentPage + 1)}
                  disabled={
                    modalCurrentPage >=
                    Math.ceil(sortedData.length / modalItemsPerPage)
                  }
                  className="gap-2 rounded-lg"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
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
              {t("sure_discription")}
            </p>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
              disabled={isDeleting}
            >
              {t("no")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-destructive/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("yes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailModal;

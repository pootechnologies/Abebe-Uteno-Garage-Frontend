import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Trash,
  Pencil,
  ScrollText,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Hash,
  UserCircle,
  DollarSign,
  CreditCard,
  Info,
  Search,
  AlertTriangle,
} from "lucide-react";
import {
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import useSupplierStore from "@/stores/useSupplierStore.ts";
import { toast } from "react-hot-toast";
import SupplierLogModal from "../components/SupplierLogModal";
import { t } from "i18next";
import SearchSupplier from "../components/SearchSupplier";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { formatCurrency } from "@/utils/numberFormaterStats";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    Unpaid: "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[status] ?? "bg-muted text-muted-foreground border border-muted"
      }`}
    >
      {status}
    </span>
  );
};

const PurchaseExpense = () => {
  const navigate = useNavigate();
  const setSelectedSupplier = useSupplierStore(
    (state) => state.setSelectedSupplier
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplierName] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["purchaseExpenses", currentPage, selectedSupplier?.value],
    queryFn: () => {
      let url = `${API_ENDPOINTS.PURCHASE_SUPPLIERS}?page=${currentPage}`;
      if (selectedSupplier?.value && selectedSupplier.value !== "all") {
        url += `&supplier_name=${encodeURIComponent(selectedSupplier.value)}`;
      }
      return axiosInstanceOld.get(url).then((res) => res.data);
    },
  });

  const queryClient = useQueryClient();

  const handleDeleteClick = (id) => {
    setSupplierToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      const res = await axiosInstanceOld.delete(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${supplierToDelete}`
      );
      if (res.status === 200 || res.status === 204) {
        toast.success("Purchase record deleted successfully!");
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
      } else {
        toast.error("Unexpected response while deleting.");
      }
    } catch (err) {
      toast.error("Failed to delete purchase record!");
      console.error(err);
    } finally {
      setIsDeleting(false);
      setSupplierToDelete(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const id = selectedRow.id;
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
      };
      const res = await axiosInstanceOld.patch(
        `${API_ENDPOINTS.PURCHASE_SUPPLIERS}${id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Supplier updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["purchaseExpenses"] });
        await queryClient.refetchQueries({
          queryKey: ["supplierLogs", selectedRow?.id],
        });
      } else {
        toast.error("Unexpected response while updating supplier.");
      }
    } catch (err) {
      toast.error("Failed to update supplier!");
      console.error(err);
    }
  };

  const handleOpenLogModal = () => {
    setIsLogModalOpen(true);
  };

  const handleViewDetails = (row) => {
    setSelectedSupplier(row);
    navigate("/expense-detail");
  };

  const purchaseExpenses = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {t("manage_purchase_suppliers")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <div className="pl-8">
                  <SearchSupplier onSupplierSelect={setSelectedSupplierName} />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total") || "Total"}:{" "}
                  <span className="font-semibold text-foreground">{totalCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  <TableHead className="w-[80px] font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("supplier")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                      {t("total_amount")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {t("payment_status")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">{t("paid_amount")}</TableHead>
                  <TableHead className="font-bold text-foreground">{t("unpaid_amount")}</TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("created_by")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : purchaseExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      {t("no_data_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseExpenses.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-muted-foreground font-medium">
                        #{supplier.id}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <button
                          onClick={() => handleViewDetails(supplier)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {supplier.supplier_name}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(supplier.total_amount)} ETB
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={supplier.payment_status} />
                      </TableCell>
                      <TableCell className="text-emerald-600 font-medium">
                        {formatCurrency(supplier.paid_amount)} ETB
                      </TableCell>
                      <TableCell className="text-red-500 font-medium">
                        {formatCurrency(supplier.unpaid_amount)} ETB
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(supplier.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {supplier.user}
                          </span>
                        </div>
                      </TableCell>
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
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px] rounded-xl p-1 shadow-xl border-muted"
                          >
                            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                              {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRow(supplier);
                                setPaymentStatus(supplier.payment_status);
                                setPaidAmount(supplier.paid_amount);
                                setModalOpen(true);
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update_status")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRow(supplier);
                                handleOpenLogModal();
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <ScrollText className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("logs")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                navigate("/expense-detail");
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(supplier.id)}
                              className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
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

          {/* Mobile View - Cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card border rounded-xl p-4 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                  </div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </div>
              ))
            ) : purchaseExpenses.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">
                  {t("no_data_found")}
                </p>
              </div>
            ) : (
              purchaseExpenses.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all"
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">
                          #{supplier.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                          {t("supplier")}
                        </span>
                        <button
                          onClick={() => handleViewDetails(supplier)}
                          className="font-bold text-lg text-blue-600 hover:underline leading-tight"
                        >
                          {supplier.supplier_name || "N/A"}
                        </button>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50"
                      >
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                          {t("actions")}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRow(supplier);
                            setPaymentStatus(supplier.payment_status);
                            setPaidAmount(supplier.paid_amount);
                            setModalOpen(true);
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-orange-500/10 transition-colors"
                        >
                          <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update_status")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRow(supplier);
                            handleOpenLogModal();
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                        >
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <ScrollText className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("logs")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            navigate("/expense-detail");
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                        >
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(supplier.id)}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors"
                        >
                          <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                            <Trash className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-sm">{t("delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Summary fields */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("total_amount")}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(supplier.total_amount)} ETB
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("payment_status")}
                      </span>
                      <StatusBadge status={supplier.payment_status} />
                    </div>
                  </div>

                  {/* Created by */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {t("created_by")}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                        {(supplier.user || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {supplier.user}
                      </span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() =>
                      setExpandedCards((prev) => {
                        const isCurrentlyExpanded = prev[supplier.id];
                        return isCurrentlyExpanded
                          ? {}
                          : { [supplier.id]: true };
                      })
                    }
                    className="w-full pt-3 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedCards[supplier.id] ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Show Details</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {expandedCards[supplier.id] && (
                    <div className="pt-3 border-t space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("paid_amount")}</span>
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(supplier.paid_amount)} ETB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("unpaid_amount")}</span>
                        <span className="font-medium text-red-500">
                          {formatCurrency(supplier.unpaid_amount)} ETB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination Section */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Update Status Modal (MUI) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ ...modalStyle }} className="w-[85%] md:w-[35%] rounded-2xl">
          <Typography variant="h6" component="h2" className="font-bold">
            {t("update_payment_status")}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-status-label">
              {t("payment_status")}
            </InputLabel>
            <Select
              labelId="payment-status-label"
              value={paymentStatus}
              label="Payment Status"
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <MenuItem value="Pending">{t("pending")}</MenuItem>
              <MenuItem value="Paid">{t("paid")}</MenuItem>
              <MenuItem value="Unpaid">{t("unpaid")}</MenuItem>
            </Select>
          </FormControl>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
              onClick={handleUpdate}
            >
              {t("update_status")}
            </Button>
          </div>
        </Box>
      </Modal>

      <SupplierLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={supplierToDelete !== null}
        onOpenChange={(open) => { if (!open) setSupplierToDelete(null); }}
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
            <DialogDescription className="text-muted-foreground font-medium px-4 leading-relaxed text-center">
              {t("sure_description_purchase") || "Are you sure you want to delete this purchase record? This action cannot be undone."}
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setSupplierToDelete(null)}
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
                <Trash className="h-4 w-4" />
              )}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseExpense;

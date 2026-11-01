import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  ReceiptText,
  MoreVertical,
  Pencil,
  ScrollText,
  Trash,
  User,
  Wallet,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Hash,
  UserCircle,
  Calendar,
  Info,
  Plus,
  AlertTriangle,
  ArrowLeft,
  X,
  Layers,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useCustomerStore from "@/stores/useCustomerStore.ts";
import { formatCurrency } from "@/utils/numberFormaterStats";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { t } from "i18next";
import { openCustomerPurchasePdf } from "../components/CustomerPurchasePdf";
import CustomerExpenseLogModal from "../components/CustomerExpenseLogModal";
import CustomerExpenseProductModal from "../components/CustomerExpenseProductModal";
import CustomerPurchaseAddModal from "../components/CustomerPurchaseAddModal";
import CustomerAddProductModal from "../components/CustomerAddProductModal";
import UpdateCustomerExpenseProductModal from "../components/UpdateCustomerExpenseProductModal";


const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border border-amber-200",
    Unpaid: "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-muted text-muted-foreground border border-muted"
        }`}
    >
      {status}
    </span>
  );
};

const PerformaBadge = ({ performa }: { performa: boolean }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      performa
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }`}
  >
    {performa ? t("yes") : t("no")}
  </span>
);

const CustomerExpenseDetailPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [modalOpenExpense, setModalOpenExpense] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expenseId, setExpenseId] = useState();
  const [expandedCards, setExpandedCards] = useState({});
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const itemsPerPage = 3;
  const navigate = useNavigate();
  const selectedCustomer = useCustomerStore((state: any) => state.selectedCustomer);
  const setSelectedCustomer = useCustomerStore(
    (state: any) => state.setSelectedCustomer
  );
  const queryClient = useQueryClient();

  const fetchCustomerData = async (page = 1) => {
    const url = `${API_ENDPOINTS.CREDIT_CUSTOMERS}${selectedCustomer?.id}?page=${page}`;
    const res = await axiosInstanceOld.get(url);
    const customerData = res.data;
    setSelectedCustomer(customerData.data);
    return customerData;
  };

  const { data, isLoading, isError, error, refetch } =useQuery({
    queryKey: ["customerPurchaseSupplier", selectedCustomer?.id, currentPage],
    queryFn: () => fetchCustomerData(currentPage),
    refetchInterval: 2000,
  });

  const productColumns = [
    { field: "id", headerName: t("id"), width: 70 },
    { field: "product_name", headerName: t("products"), width: 150 },
    { field: "part_number", headerName: t("part_number"), width: 150 },
    { field: "unit", headerName: t("unit"), width: 100 },
    { field: "description", headerName: t("description"), width: 150 },
    { field: "unit_price", headerName: t("unit_price"), width: 150 },
    { field: "quantity", headerName: t("quantity"), width: 100 },
    { field: "total_price", headerName: t("total_price"), width: 150 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 100,
      sortable: false,
      renderCell: (params: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              onClick={() => handleDeleteProduct(params.row.id)}
              className="flex items-center gap-2 text-destructive"
            >
              <Trash className="w-4 h-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleAddExpenseClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOpenLogModal = () => {
    setIsLogModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axiosInstanceOld.delete(`${API_ENDPOINTS.CREDIT_PRODUCTS}${id}`);
      toast.success("Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["customerPurchaseSupplier"] });
      await refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product.");
    }
  };

  const handleView = (product: any) => {
    setSelectedProduct(product);
    setIsUpdateProductModalOpen(true);
  };

  const handleProductsPageChange = (event: any, pageNumber: number) => {
    setCurrentProductsPage(pageNumber);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedData = {
        ...selectedRow,
        payment_status: paymentStatus,
        paid_amount: paidAmount,
      };
      const res = await axiosInstanceOld.patch(
        `${API_ENDPOINTS.CREDIT_CREDITS}${selectedRow.id}`,
        updatedData
      );
      if (res.status === 200) {
        toast.success("Customer purchase updated successfully!");
        setModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["customerPurchaseSupplier"] });
        await refetch();
      } else {
        toast.error("Unexpected response while updating customer purchase.");
      }
    } catch (err) {
      toast.error("Failed to update customer purchase!");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstanceOld.delete(`${API_ENDPOINTS.CREDIT_CREDITS}${expenseToDelete}`);
      await queryClient.invalidateQueries({ queryKey: ["customerPurchaseSupplier"] });
      await refetch();
      toast.success("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense.");
    } finally {
      setIsDeleting(false);
      setExpenseToDelete(null);
    }
  };

  // Data handling for expenses
  const expenses = data?.credits?.results || [];
  const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);
  const pageCount = Math.ceil((data?.credits?.count || 0) / itemsPerPage);

  // Data handling for products
  const products = selectedProducts.products || [];
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);
  const displayProducts = sortedProducts.slice(
    (currentProductsPage - 1) * itemsPerPage,
    currentProductsPage * itemsPerPage
  );
  const productPageCount = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Top Sticky Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="cursor-pointer">
                    <BreadcrumbLink onClick={() => navigate("/manage-customer-purchase")} className="hover:text-emerald-600 transition-colors font-medium">
                      {t("manage_credit")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-gray-900">
                      {t("credit_detail")}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("credit_detail")} <span className="text-emerald-600">#{selectedCustomer?.id || ""}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">

            {/* Customer info banner */}
            {selectedCustomer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Customer name */}
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t("customer")}/{"organization"}
                    </p>
                    <p className="font-bold text-sm text-black truncate">
                      {selectedCustomer.organization || selectedCustomer.supplier_name}
                    </p>
                  </div>
                </div>
                {/* Total amount */}
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg shrink-0">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t("total_amount")}
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {formatCurrency(selectedCustomer.total_amount)} ETB
                    </p>
                  </div>
                </div>
                {/* Paid amount */}
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg shrink-0">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t("paid_amount")}
                    </p>
                    <p className="font-bold text-sm text-emerald-600">
                      {formatCurrency(selectedCustomer.paid_amount)} ETB
                    </p>
                  </div>
                </div>
                {/* Unpaid amount */}
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700/30 rounded-xl">
                  <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg shrink-0">
                    <Wallet className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t("unpaid_amount")}
                    </p>
                    <p className="font-bold text-sm text-red-500">
                      {formatCurrency(selectedCustomer.unpaid_amount)} ETB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {t("total") || "Total"}:{" "}
                  <span className="font-semibold text-foreground">
                    {data?.credits?.count ?? 0}
                  </span>
                </div>
                <Button
                  onClick={handleAddExpenseClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_credit")}
                </Button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Spinner size="large" />
                </div>
              ) : (
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
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {t("date")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {t("customer")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <ScrollText className="h-3.5 w-3.5 text-primary" />
                          {t("performa")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          {t("number_of_items")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("sub_total")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("vat")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("total")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">{t("paid_amount")}</TableHead>
                      <TableHead className="font-bold text-foreground">{t("unpaid_amount")}</TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          {t("payment_status")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-3.5 w-3.5 text-primary" />
                          {t("user")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={13}
                          className="h-32 text-center text-muted-foreground font-medium"
                        >
                          {t("no_data_found")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedExpenses.map((expense) => (
                        <TableRow
                          key={expense.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="text-muted-foreground font-medium">
                            #{expense.id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTypeStamp(expense.credit_date || expense.purchase_date)}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {expense.customer || t("n_a")}
                          </TableCell>
                          <TableCell>
                            <PerformaBadge performa={expense.performa} />
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {expense.number_of_items}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(expense.sub_total)} ETB
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(expense.vat)} ETB
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(expense.total)} ETB
                          </TableCell>
                          <TableCell className="text-emerald-600 font-medium">
                            {formatCurrency(expense.paid_amount)} ETB
                          </TableCell>
                          <TableCell className="text-red-500 font-medium">
                            {formatCurrency(expense.unpaid_amount)} ETB
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={expense.payment_status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                {(expense.user || "U").substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {expense.user}
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
                                    setSelectedRow(expense);
                                    setPaymentStatus(expense.payment_status);
                                    setPaidAmount(expense.paid_amount);
                                    setModalOpen(true);
                                  }}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <Pencil className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium text-sm">{t("update_status")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRow(expense);
                                    setIsLogModalOpen(true);
                                  }}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <ScrollText className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">{t("logs")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedProducts(expense || []);
                                    setModalOpenExpense(true);
                                  }}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <Eye className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">{t("view")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const eid = expense.id;
                                    openCustomerPurchasePdf(eid, {selectedCustomer});
                                  }}
                                  className="gap-3 rounded-lg px-2 py-2.5"
                                >
                                  <ReceiptText className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-sm">Receipt</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-muted" />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(expense.id)}
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
              )}
            </div>

            {/* Mobile Cards */}
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
              ) : sortedExpenses.length === 0 ? (
                <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {t("no_data_found")}
                  </p>
                </div>
              ) : (
                sortedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all"
                  >
                    {/* Card header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">
                            #{expense.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                            {t("date")}
                          </span>
                          <h3 className="font-bold text-base text-black leading-tight">
                            {formatDateTypeStamp(expense.credit_date || expense.purchase_date)}
                          </h3>
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
                              setSelectedRow(expense);
                              setPaymentStatus(expense.payment_status);
                              setPaidAmount(expense.paid_amount);
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
                              setSelectedRow(expense);
                              setIsLogModalOpen(true);
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
                              setSelectedProducts(expense || []);
                              setModalOpenExpense(true);
                            }}
                            className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                          >
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">{t("view")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const eid = expense.id;
                              openCustomerPurchasePdf(eid, selectedCustomer);
                            }}
                            className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                          >
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                              <ReceiptText className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">Receipt</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted/50" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(expense.id)}
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
                          {t("customer")}
                        </span>
                        <span className="font-bold text-foreground">
                          {expense.customer || t("n_a")}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("performa")}
                        </span>
                        <PerformaBadge performa={expense.performa} />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("number_of_items")}
                        </span>
                        <span className="font-bold text-foreground">
                          {expense.number_of_items}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("sub_total")}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(expense.sub_total)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("vat")}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(expense.vat)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("total")}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(expense.total)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("paid_amount")}
                        </span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(expense.paid_amount)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("unpaid_amount")}
                        </span>
                        <span className="font-bold text-red-500">
                          {formatCurrency(expense.unpaid_amount)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("payment_status")}
                        </span>
                        <StatusBadge status={expense.payment_status} />
                      </div>
                    </div>

                    {/* Created by */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("user")}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(expense.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {expense.user}
                        </span>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() =>
                        setExpandedCards((prev) => {
                          const isCurrentlyExpanded = prev[expense.id];
                          return isCurrentlyExpanded ? {} : { [expense.id]: true };
                        })
                      }
                      className="w-full pt-3 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedCards[expense.id] ? (
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

                    {expandedCards[expense.id] && (
                      <div className="pt-3 border-t space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("customer")}</span>
                          <span className="font-medium">{expense.customer || t("n_a")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("performa")}</span>
                          <PerformaBadge performa={expense.performa} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("number_of_items")}</span>
                          <span className="font-medium">{expense.number_of_items}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("sub_total")}</span>
                          <span className="font-medium">{formatCurrency(expense.sub_total)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("vat")}</span>
                          <span className="font-medium">{formatCurrency(expense.vat)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("total")}</span>
                          <span className="font-medium">{formatCurrency(expense.total)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("paid_amount")}</span>
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(expense.paid_amount)} ETB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("unpaid_amount")}</span>
                          <span className="font-medium text-red-500">
                            {formatCurrency(expense.unpaid_amount)} ETB
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("payment_status")}</span>
                          <StatusBadge status={expense.payment_status} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
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
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pageCount > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > pageCount) pageNum = pageCount - (4 - i);
                      }
                    }
                    if (pageNum <= pageCount) {
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
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount))
                  }
                  disabled={currentPage === pageCount || pageCount === 0}
                  className="gap-2 rounded-lg"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          {/* Modal card */}
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/30">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-emerald-600">
                      {t("update_payment_status")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5">
                    {t("payment_status")}
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full h-11 px-3 appearance-none rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none font-medium cursor-pointer"
                  >
                    <option value="Pending">{t("pending")}</option>
                    <option value="Paid">{t("paid")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5">
                    {t("paid_amount")}
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                    {t("unpaid_amount")}: <span className="font-semibold text-red-500">{formatCurrency(selectedRow?.unpaid_amount || 0)} ETB</span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-muted/30 flex sm:justify-end gap-3 border-t border-muted">
                <Button
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("updating...")}
                    </span>
                  ) : (
                    t("update_status")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={expenseToDelete !== null}
        onOpenChange={(open) => { if (!open) setExpenseToDelete(null); }}
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
              Do you really want to delete this credit? This action cannot be undone.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setExpenseToDelete(null)}
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

      {/* Customer Expense Modals */}
      <CustomerExpenseLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedRow={selectedRow}
      />
      <CustomerExpenseProductModal
        selectedProducts={selectedProducts}
        modalOpenExpense={modalOpenExpense}
        setModalOpenExpense={setModalOpenExpense}
        setIsAddProductModalOpen={setIsAddProductModalOpen}
        productColumns={productColumns}
        handleView={handleView}
        handleDeleteProduct={handleDeleteProduct}
      />
      <CustomerAddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          refetch();
        }}
        selectedProducts={selectedProducts}
      />
      <UpdateCustomerExpenseProductModal
        isUpdateProductModalOpen={isUpdateProductModalOpen}
        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        formatCurrency={formatCurrency}
      />
      <CustomerPurchaseAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
      />
    </div>
  );
};

export default CustomerExpenseDetailPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Eye,
  MoreVertical,
  Trash,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Calendar,
  DollarSign,
  Search,
  Plus,
  Info,
  UserCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { API_BASE_URL, API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import usePerformaStore from "@/stores/usePerformaStore.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import PerformaDetailModal from "../components/PerformaDetailModal.tsx";
import DownloadConfirmationModal from "../components/DownloadConfirmationModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import ManagePerformaPdf from "../components/ManagePerformaPdf.tsx";
import UpdateShanciTargaModal from "../components/UpdateShanciTargaModal.tsx";
import { formatCurrency } from "@/utils/numberFormaterStats.ts";
import axiosInstance from "@/api/axios.tsx";

const hasServiceCharges = (performa) =>
  Number(performa?.service_charge) > 0 ||
  Number(performa?.products_service_charge) > 0;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl relative">
        {children}
        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            className="rounded-lg font-medium transition-colors border-muted hover:bg-muted/50 px-6 py-2"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PerformaDetailPage = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProductsPage, setCurrentProductsPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpenExpense, setModalOpenExpense] = useState(false);
  const [showPerformaDetailsModal, setShowPerformaDetailsModal] = useState(false);
  const [selectedPerformaDetailId, setSelectedPerformaDetailId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false);
  const [pdfToDownload, setPdfToDownload] = useState(null);
  const [search, setSearch] = useState("");
  const [isUpdateShanciTargaModalOpen, setIsUpdateShanciTargaModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [performaToDelete, setPerformaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [performaToOrder, setPerformaToOrder] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [performaToCredit, setPerformaToCredit] = useState(null);
  const [isAddingToCredit, setIsAddingToCredit] = useState(false);

  const itemsPerPage = 10;
  const navigate = useNavigate();
  const selectedCustomerPerforma = usePerformaStore(
    (state) => state.selectedCustomerPerforma
  );
  const performId = selectedCustomerPerforma?.id;
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;

  const { data: performas, isLoading: isLoadingPerformas } = useQuery({
    queryKey: ["performaCustomers", performId, page, search],
    queryFn: () =>
      axiosInstanceOld
        .get(
          `${API_ENDPOINTS.PERFORMA_CUSTOMER}${performId}?page=${page}&search=${search}`
        )
        .then((res) => res.data),
  });

  const customerPerformas = performas?.performas?.results || [];
  const totalCount = performas?.performas?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleDeleteClick = (id) => {
    setPerformaToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!performaToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axiosInstanceOld.delete(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaToDelete}`
      );
      if (response.status === 200) {
        toast.success("Performa deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["performaCustomers"] });
        queryClient.invalidateQueries({ queryKey: ["performaDetailItems"] });
      } else {
        toast.error("Failed to delete performa");
      }
    } catch (error) {
      console.error("Error deleting performa:", error);
      toast.error("An error occurred while deleting the performa");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPerformaToDelete(null);
    }
  };

  const handleOrderClick = (performa) => {
    setPerformaToOrder(performa);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!performaToOrder) return;
    setIsOrdering(true);
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaToOrder?.id}${API_ENDPOINTS.TO_ORDERS}`
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Successfully converted to order");
        queryClient.invalidateQueries({ queryKey: ["performaCustomers"] });
      } else {
        toast.error("Failed to convert to order");
      }
    } catch (error) {
      console.error("Error converting to order:", error);
      toast.error("An error occurred while converting to order");
    } finally {
      setIsOrdering(false);
      setShowOrderModal(false);
      setPerformaToOrder(null);
    }
  };

  const handleCreditClick = (performa) => {
    setPerformaToCredit(performa);
    setShowCreditModal(true);
  };

  const handleConfirmCredit = async () => {
    if (!performaToCredit) return;
    setIsAddingToCredit(true);
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}${API_ENDPOINTS.PERFORMA_PERFORMAS}${performaToCredit?.id}${API_ENDPOINTS.TO_CREDIT}`
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Successfully added to credit");
        queryClient.invalidateQueries({ queryKey: ["performaCustomers"] });
      } else {
        toast.error("Failed to add to credit");
      }
    } catch (error) {
      console.error("Error adding to credit:", error);
      toast.error("An error occurred while adding to credit");
    } finally {
      setIsAddingToCredit(false);
      setShowCreditModal(false);
      setPerformaToCredit(null);
    }
  };

  const createPerformaPdf = async ({ row, performa, allPaymentData }) => {
    return pdf(
      <ManagePerformaPdf
        fourDegitId={row.id}
        carShanci={row}
        selectedPerformaDetailId={row.id}
        data={performa?.items ?? []}
        performaServiceCharge={allPaymentData?.service_charge ?? 0}
        customer={performa?.customer?.organization ?? ""}
        companyData={companyData}
        receipt={allPaymentData?.receipt ?? ""}
        AllPaymentData={allPaymentData}
      />
    ).toBlob();
  };

  const handleViewPerforma = async (row) => {
    try {
      const response = await axiosInstanceOld.get(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${row.id}/receipt/`
      );
      const allPaymentData = response.data?.performa_details ?? null;
      const pdfDetails = { row, performa: response.data, allPaymentData };

      if (isMobile) {
        setPdfToDownload(pdfDetails);
        setShowDownloadConfirmation(true);
        return;
      }

      const blob = await createPerformaPdf({ ...pdfDetails });
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (error) {
      console.error("Error generating performa PDF:", error);
      toast.error("Failed to generate performa PDF");
    }
  };

  const handleConfirmDownload = async () => {
    if (pdfToDownload) {
      const blob = await createPerformaPdf(pdfToDownload);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const customerNameForDownload = pdfToDownload.row?.customer || "customer";
      link.download = `Performa_${customerNameForDownload}_${formatPerformaDate(
        pdfToDownload.row?.issued_date
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setShowDownloadConfirmation(false);
      setPdfToDownload(null);
    }
  };

  const formatPerformaDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleString(undefined, options);
  };

  const closeModal = () => {
    setShowPerformaDetailsModal(false);
  };

  const openAddPerformaPage = () => {
    navigate("/add-customer-performa");
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstanceOld.get(`${API_ENDPOINTS.COMPANY}`);
        const data = response.data[0];
        setCompanyData(data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                    <BreadcrumbLink onClick={() => navigate("/manage-performa")} className="hover:text-emerald-600 transition-colors font-medium">
                      {t("manage_performa")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-gray-900">
                      {t("performa_details")}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("performa_details")} <span className="text-emerald-600">#{selectedCustomerPerforma?.id || ""}</span>
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
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-xl">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {t("customer")} / {t("organization")}
                </p>
                <p className="font-bold text-base text-black">
                  {selectedCustomerPerforma?.customer_name || "N/A"}
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full xl:w-96 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                  <input
                    type="search"
                    placeholder={t("search_shanci_or_targa")}
                    className="w-full pl-9 pr-4 py-2 border rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    {t("total") || "Total"}:{" "}
                    <span className="font-semibold text-foreground">{totalCount}</span>
                  </div>
                  <Button
                    onClick={openAddPerformaPage}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t("add_performa")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
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
                        <UserCircle className="h-3.5 w-3.5 text-primary" />
                        {t("customer")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {t("shanci_kutir")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {t("targa_kutir")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {t("issued_date")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("sub_total")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">Service Charge</TableHead>
                    <TableHead className="font-bold text-foreground">{t("vat")}</TableHead>
                    <TableHead className="font-bold text-foreground">{t("ordered_items")}</TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("total_amount")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">{t("receipt")}</TableHead>
                    <TableHead className="font-bold text-foreground">{t("user")}</TableHead>
                    <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPerformas ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        {Array.from({ length: 13 }).map((_, j) => (
                          <TableCell key={j} className="h-16">
                            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : customerPerformas.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="h-32 text-center text-muted-foreground font-medium"
                      >
                        {t("no_data_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerPerformas.map((performa) => (
                      <TableRow
                        key={performa.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground font-medium">
                          #{performa.id}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {performa.customer || "N/A"}
                        </TableCell>
                        <TableCell>{performa.shanci_kutir || "N/A"}</TableCell>
                        <TableCell>{performa.targa_kutir || "N/A"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatPerformaDate(performa.issued_date)}
                        </TableCell>
                        <TableCell>{formatCurrency(performa.sub_total)}</TableCell>
                        <TableCell>{formatCurrency(performa.service_charge || 0)}</TableCell>
                        <TableCell>{formatCurrency(performa.vat)}</TableCell>
                        <TableCell>{performa.number_of_items || 0}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(performa.total)}</TableCell>
                        <TableCell>{performa.receipt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                              {(performa.user || "U").substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {performa.user}
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
                                  setSelectedProducts(performa?.performas?.results || []);
                                  setSelectedPerformaDetailId(performa?.id);
                                  setShowPerformaDetailsModal(true);
                                }}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">{t("view")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  handleViewPerforma(performa);
                                }}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Receipt className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">Receipt</span>
                              </DropdownMenuItem>

                              {!hasServiceCharges(performa) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleOrderClick(performa)}
                                    className="gap-3 rounded-lg px-2 py-2.5"
                                  >
                                    <ShoppingCart className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm">
                                      To Order
                                    </span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleCreditClick(performa)}
                                    className="gap-3 rounded-lg px-2 py-2.5"
                                  >
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm">
                                      To Credit
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRow(performa.id);
                                  setIsUpdateShanciTargaModalOpen(true);
                                }}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Pencil className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">{t("update")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(performa.id)}
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

            {/* Mobile Cards */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
              {isLoadingPerformas ? (
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
              ) : customerPerformas.length === 0 ? (
                <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {t("no_data_found")}
                  </p>
                </div>
              ) : (
                customerPerformas.map((performa) => (
                  <div
                    key={performa.id}
                    className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all"
                  >
                    {/* Card header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">
                            #{performa.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                            {t("customer")}
                          </span>
                          <h3 className="font-bold text-lg text-black leading-tight">
                            {performa.customer || "N/A"}
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
                              setSelectedProducts(performa?.performas?.results || []);
                              setSelectedPerformaDetailId(performa?.id);
                              setShowPerformaDetailsModal(true);
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
                              handleViewPerforma(performa);
                            }}
                            className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                          >
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">Performa</span>
                          </DropdownMenuItem>
                          {!hasServiceCharges(performa) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleOrderClick(performa)}
                                className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                              >
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium text-sm">
                                  To Order
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleCreditClick(performa)}
                                className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                              >
                                <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                  <CreditCard className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium text-sm">
                                  Add to Credit
                                </span>
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRow(performa.id);
                              setIsUpdateShanciTargaModalOpen(true);
                            }}
                            className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                          >
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                              <Pencil className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">{t("update")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted/50" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(performa.id)}
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
                          {t("issued_date")}
                        </span>
                        <span className="font-medium text-foreground text-xs">
                          {formatPerformaDate(performa.issued_date)}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("total_amount")}
                        </span>
                        <span className="font-bold text-foreground">
                          {formatCurrency(performa.total)} ETB
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("shanci_kutir")}
                        </span>
                        <span className="font-medium text-foreground">
                          {performa.shanci_kutir || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          {t("targa_kutir")}
                        </span>
                        <span className="font-medium text-foreground">
                          {performa.targa_kutir || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Created by */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("user")}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(performa.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {performa.user}
                        </span>
                      </div>
                    </div>

                    {/* Expand / collapse */}
                    <button
                      onClick={() =>
                        setExpandedCards((prev) => {
                          const isCurrentlyExpanded = prev[performa.id];
                          return isCurrentlyExpanded ? {} : { [performa.id]: true };
                        })
                      }
                      className="w-full pt-3 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedCards[performa.id] ? (
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

                    {expandedCards[performa.id] && (
                      <div className="pt-3 border-t space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("sub_total")}</span>
                          <span className="font-medium">{formatCurrency(performa.sub_total)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("service_charge")}</span>
                          <span className="font-medium">{formatCurrency(performa.service_charge || 0)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("vat")}</span>
                          <span className="font-medium">{formatCurrency(performa.vat)} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("ordered_items")}</span>
                          <span className="font-medium">{performa.number_of_items || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("receipt")}</span>
                          <span className="font-medium">{performa.receipt}</span>
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
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page > 3) {
                        pageNum = page - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                    }
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setPage(pageNum)}
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
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
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

      {/* Modals */}
      <PerformaDetailModal
        showPerformaDetailsModal={showPerformaDetailsModal}
        selectedPerformaDetailId={selectedPerformaDetailId}
        closeModal={closeModal}
      />

      {
        showDownloadConfirmation && (
          <DownloadConfirmationModal
            isOpen={showDownloadConfirmation}
            onClose={() => {
              setShowDownloadConfirmation(false);
              setPdfToDownload(null);
            }}
            onConfirm={handleConfirmDownload}
          />
        )
      }

      <UpdateShanciTargaModal
        isOpen={isUpdateShanciTargaModalOpen}
        onClose={() => setIsUpdateShanciTargaModalOpen(false)}
        selectedRow={selectedRow}
      />

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
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
              {t("sure_discription_performa")}
            </p>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
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

      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-[1001]">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 rounded-full shadow-inner">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-600">
                Confirm Order
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground font-medium px-4 leading-relaxed">
              Are you sure you want to convert this performa to an order?
            </p>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setShowOrderModal(false)}
              className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
              disabled={isOrdering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={isOrdering}
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700"
            >
              {isOrdering ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-[1001]">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 rounded-full shadow-inner">
              <CreditCard className="h-10 w-10" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-600">
                Add to Credit
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground font-medium px-4 leading-relaxed">
              Are you sure you want to add this performa to credit?
            </p>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setShowCreditModal(false)}
              className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
              disabled={isAddingToCredit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCredit}
              disabled={isAddingToCredit}
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700"
            >
              {isAddingToCredit ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default PerformaDetailPage;

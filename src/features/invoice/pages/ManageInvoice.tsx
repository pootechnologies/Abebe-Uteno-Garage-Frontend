import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getInvoice, deleteInvoice } from "../api/invoices";
import { getAllCustomers } from "../../jobCard/api/jobCard";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  FileText,
  UserCircle,
  Building,
  Calendar,
  DollarSign,
  CreditCard,
  Hash,
  ChevronLeft,
  ChevronRight,
  Info,
  Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { formatCurrency } from "@/utils/numberFormaterStats";
import Select from "react-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: number;
  job_card: string;
  customer_name: string;
  organization_name: string;
  invoice_date: string;
  sub_total: number;
  vat: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  payment_status: string;
  user: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
}

const PAGE_SIZE = 10;

const ManageInvoices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [selectedSearch, setSelectedSearch] = useState<{ value: string; label: string } | null>(null);

  // Fetch all customers for the dropdown
  const { data: allCustomers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
  });

  const customerOptions = allCustomers.map((customer: any) => ({
    value: customer.name,
    label: customer.organization || customer.name,
  }));

  const {
    data: invoicesData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["invoices", page, selectedSearch?.value],
    queryFn: () => getInvoice(page, selectedSearch?.value || ""),
    placeholderData: keepPreviousData,
  });

  const handleViewDetails = (id: number) => {
    navigate(`/invoices/view/${id}`);
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    setInvoiceToDelete(invoiceId);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateInvoice = (id: number) => {
    navigate(`/invoices/update/${id}`);
  };

  const confirmDeleteInvoice = async () => {
    if (invoiceToDelete === null) return;
    try {
      await deleteInvoice(invoiceToDelete);
      refetch();
      setIsDeleteModalOpen(false);
      toast.success(t("invoice_deleted_successfully"));
    } catch (error) {
      console.error(t("error_deleting_invoice"), error);
      toast.error(t("failed_to_delete_invoice"));
    }
  };

  const totalPages = Math.ceil((invoicesData?.count || 0) / PAGE_SIZE);
  const invoices = Array.isArray(invoicesData?.results)
    ? [...invoicesData.results].sort((a, b) => b.id - a.id)
    : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            {t("manage_invoices")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={customerOptions}
                  isClearable
                  isLoading={isLoadingCustomers}
                  placeholder={t("select_customer_name")}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option: any) => {
                    setSelectedSearch(option);
                    setPage(1);
                  }}
                  styles={{
                    control: (base: any) => ({
                      ...base,
                      paddingLeft: "2rem",
                      borderRadius: "0.75rem",
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      "&:hover": {
                        borderColor: "var(--primary)",
                      },
                    }),
                    menu: (base: any) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    }),
                  }}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total") || "Total"}: <span className="font-semibold text-foreground">{invoicesData?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40 text-nowrap">
                  <TableHead className="w-[80px] font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                       <UserCircle className="h-3.5 w-3.5 text-primary" />
                       {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {t("organization")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("invoice_date")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right border-l border-muted/50">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-3.5 w-3.5 " />
                      {t("total_amount")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 ml-4">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {t("payment_status")}
                    </div>
                  </TableHead>
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
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_invoices_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                      <TableCell className="text-muted-foreground font-medium">#{invoice.id}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-bold text-blue-600 hover:text-primary transition-colors hover:underline text-left whitespace-normal max-w-[200px]"
                          onClick={() => handleViewDetails(invoice.id)}
                        >
                          {invoice.customer_name || "N/A"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm font-medium  max-w-[150px] truncate">{invoice.organization_name || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-nowrap">{formatDateTypeStamp(invoice.invoice_date) || "N/A"}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 border-l border-dashed border-muted/50 bg-emerald-50/20 dark:bg-emerald-500/5">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell>
                         <div className="ml-4">
                           <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                             invoice.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                             invoice.payment_status?.toLowerCase() === 'unpaid' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                             'bg-amber-100 text-amber-700 border border-amber-200'
                           }`}>
                             {invoice.payment_status || "N/A"}
                           </span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(invoice.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{invoice.user || "N/A"}</span>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Eye className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateInvoice(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Pencil className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive cursor-pointer font-bold">
                              <Trash2 className="h-4 w-4 text-rose-500" />
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

          {/* Mobile View: Cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {isLoading ? (
               Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="bg-card border rounded-2xl p-5 space-y-4 animate-pulse">
                   <div className="h-4 w-20 bg-muted rounded"></div>
                   <div className="h-6 w-48 bg-muted rounded"></div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                   </div>
                 </div>
               ))
            ) : invoices.length === 0 ? (
              <div className="bg-card border rounded-2xl p-10 text-center space-y-4">
                 <div className="mx-auto w-14 h-14 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-8 w-8" />
                 </div>
                 <p className="font-semibold text-muted-foreground">{t("no_invoices_found")}</p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="bg-card border rounded-2xl p-5 shadow-xs space-y-5 group hover:border-emerald-500/50 transition-all border-muted">
                  <div className="flex justify-between items-start border-b border-muted pb-4">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded leading-none">#{invoice.id}</span>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-blue-600 group-hover:text-emerald-600 transition-colors leading-tight">{invoice.customer_name || "N/A"}</h3>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-emerald-500/10 hover:text-emerald-600 rounded-full transition-all">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted">
                        <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                          <Eye className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateInvoice(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                          <Pencil className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive cursor-pointer font-bold">
                          <Trash2 className="h-4 w-4" />
                          <span className="font-bold text-sm">{t("delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                   <div className="grid grid-cols-2 gap-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("job_card_id")}</span>
                      <div className="text-sm font-bold text-foreground">{invoice.job_card || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-poppins">{t("total_amount")}</span>
                      <div className="text-sm font-bold text-emerald-600">{formatCurrency(invoice.total_amount)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("payment_status")}</span>
                       <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                             invoice.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                             invoice.payment_status?.toLowerCase() === 'unpaid' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                             'bg-amber-100 text-amber-700 border border-amber-200'
                           }`}>
                             {invoice.payment_status || "N/A"}
                       </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("invoice_date")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{formatDateTypeStamp(invoice.invoice_date) || "N/A"}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() =>
                      setExpandedCards((prev) => {
                        const isCurrentlyExpanded = prev[invoice.id];
                        return isCurrentlyExpanded ? {} : { [invoice.id]: true };
                      })
                    }
                    className="w-full mt-3 pt-3 border-t border-dashed border-muted flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
                  >
                    {expandedCards[invoice.id] ? (
                      <>
                        <span className="font-medium text-xs uppercase tracking-wider">{t("hide_details")}</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-xs uppercase tracking-wider">{t("show_details")}</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {expandedCards[invoice.id] && (
                    <div className="mt-3 pt-3 border-t border-muted/50 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("organization")}</span>
                          <div className="text-xs font-semibold text-blue-600">{invoice.organization_name || "N/A"}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("sub_total")}</span>
                          <div className="text-xs font-semibold text-foreground">{formatCurrency(invoice.sub_total)}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("vat")}</span>
                          <div className="text-xs font-semibold text-foreground">{formatCurrency(invoice.vat)}</div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("created_by")}</span>
                           <div className="flex items-center gap-1.5 shrink-0 mt-1">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                                 {(invoice.user || "U").substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground">{invoice.user || "N/A"}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-muted">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="h-9 gap-2 rounded-xl hover:bg-muted font-semibold transition-all px-4"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              
              <div className="flex items-center gap-1.5 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page > 3) {
                      pageNum = page - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="icon"
                        className={`h-9 w-9 rounded-xl font-bold transition-all ${
                          page === pageNum 
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" 
                            : "hover:bg-muted"
                        }`}
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
                className="h-9 gap-2 rounded-xl hover:bg-muted font-semibold transition-all px-4"
              >
                 {t("next")}
                <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteInvoice}
      />
    </div>
  );
};

export default ManageInvoices;

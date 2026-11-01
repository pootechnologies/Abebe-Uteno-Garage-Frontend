import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Eye,
  Trash2,
  MoreVertical,
  FileText,
  Search,
  Hash,
  UserCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Select from "react-select";
import usePerformaStore from "@/stores/usePerformaStore";
import {
  fetchPerformaCustomers,
  deletePerformaCustomer,
} from "../api/performa";
import { getCustomersForVehicle } from "@/features/customers/api/customer";

const ConfirmDeleteModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
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
            {t("sure_discription_customer")}
          </p>
        </div>

        <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
            disabled={isDeleting}
          >
            {t("cancel")}
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
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function ManagePerforma() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [selectedPerforma, setSelectedPerforma] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();
  const setSelectedCustomerPerforma = usePerformaStore(
    (state) => state.setSelectedCustomerPerforma
  );

  const PAGE_SIZE = 10;

  // Fetch performa customers
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["performaCustomers", page, selectedCustomer?.value],
    queryFn: () => fetchPerformaCustomers(page, selectedCustomer?.value),
    keepPreviousData: true,
    onError: () =>
      toast.error("Failed to load performa customers. Please try again."),
  });

  // Fetch customer options for react-select
  const { data: customersData, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customersForPerforma"],
    queryFn: getCustomersForVehicle,
    onError: () =>
      toast.error("Failed to load customers for select. Please try again."),
  });

  const customerOptions =
    customersData?.map((c: any) => ({
      value: c.organization,
      label: `${c.organization}`, // Include organization in the label
    })) || [];

  const handleDelete = (id: number) => {
    setSelectedPerforma(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedPerforma) return;
    try {
      await deletePerformaCustomer(selectedPerforma);
      refetch();
      toast.success("Performa customer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete performa customer. Please try again.");
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const cancelDelete = () => setShowConfirmDelete(false);

  const handleViewDetails = (performa: any) => {
    setSelectedCustomerPerforma(performa);
    navigate("/performa-detail");
  };

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const performas = data?.results || [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            {t("manage_performa")}
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
                  isLoading={isCustomersLoading}
                  value={selectedCustomer}
                  onChange={(selected) => {
                    setSelectedCustomer(selected);
                    setPage(1);
                  }}
                  placeholder={t("search_by_organization")}
                  isClearable
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2rem",
                      borderRadius: "0.75rem",
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      "&:hover": {
                        borderColor: "var(--primary)",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    }),
                  }}
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total") || "Total"}:{" "}
                  <span className="font-semibold text-foreground">
                    {data?.count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  <TableHead className="w-[100px] font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {t("organization")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("created_by")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : performas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground font-medium"
                    >
                      {t("no_data_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  performas.map((performa: any) => (
                    <TableRow
                      key={performa.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-muted-foreground font-medium">
                        #{performa.id}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <button
                          onClick={() => handleViewDetails(performa)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {performa.customer_name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
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
                                setSelectedPerforma(performa.id);
                                setSelectedCustomerPerforma(performa);
                                navigate("/performa-detail");
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(performa.id)}
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
            ) : performas.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">
                  {t("no_data_found")}
                </p>
              </div>
            ) : (
              data?.results?.map((performa: any) => (
                <div
                  key={performa.id}
                  className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">
                          #{performa.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                          {t("organization")}
                        </span>
                        <button
                          onClick={() => handleViewDetails(performa)}
                          className="font-bold text-lg text-blue-600 hover:underline leading-tight"
                        >
                          {performa.customer_name || "N/A"}
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
                            setSelectedPerforma(performa.id);
                            setSelectedCustomerPerforma(performa);
                            navigate("/performa-detail");
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
                          onClick={() => handleDelete(performa.id)}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors"
                        >
                          <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                            <Trash2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-sm">{t("delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("created_by")}
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
                  </div>
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

          {showConfirmDelete && (
            <ConfirmDeleteModal onConfirm={confirmDelete} onCancel={cancelDelete} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagePerforma;

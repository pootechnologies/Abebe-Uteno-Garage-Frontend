import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Package, 
  UserCircle, 
  Car, 
  Hash, 
  Calendar, 
  Phone, 
  Wallet, 
  Info 
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  deletePartRequest,
  getPartRequests,
  getAllCustomers,
} from "../api/vehiclePartRequest";
import { t } from "i18next";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import Select from "react-select";
import { formatCurrency } from "@/utils/numberFormaterStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PartRequestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    customer_name: string;
    customer_organization: string;
    vehicle_model: string;
    vehicle_targa_kutir: string;
    vehicle_shanci_kutir: string;
    customer_phone: string;
    ken: string;
    total_amount: number;
    user: string;
    job_card: string;
  }>;
}

const PAGE_SIZE = 10;

const ManagePartRequest = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partRequestToDelete, setPartRequestToDelete] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(null);
  const [shanciKutirSearch, setShanciKutirSearch] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Fetch customers for dropdown
  const { data: allCustomers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
  });

  // BUILD SEARCH VALUE
  const searchValue =
    shanciKutirSearch.trim() !== ""
      ? shanciKutirSearch
      : selectedOption?.value || "";

  // Fetch part requests using combined search
  const { data, isLoading, isError, refetch, error } =
    useQuery<PartRequestResponse>({
      queryKey: ["partRequests", page, searchValue],
      queryFn: () => getPartRequests(searchValue, page),
    });

  if (error) {
    console.error("Error fetching part requests:", error);
  }

  const customerOptions = allCustomers.map((customer: any) => ({
    value: customer.organization,
    label: customer.organization,
  }));

  const handleViewDetails = (id: number) => {
    navigate(`/part-request-detail/${id}`);
  };

  const handleUpdateDetails = (id: number) => {
    navigate(`/update-part-request/${id}`);
  };

  const handleDeletePartRequest = (id: number) => {
    setPartRequestToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePartRequest = () => {
    if (partRequestToDelete === null) return;

    deletePartRequest(partRequestToDelete)
      .then(() => {
        refetch();
        setIsDeleteModalOpen(false);
        toast.success(t("Part request deleted successfully!"));
      })
      .catch(() => toast.error(t("Failed to delete part request.")));
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Package className="h-6 w-6" />
            </div>
            {t("manage_part_requests")}
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
                  placeholder={t("select_customer_name")}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option: any) => {
                    setSelectedOption(option);
                    setPage(1);
                  }}
                  isLoading={isLoadingCustomers}
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
                    })
                  }}
                />
              </div>

              <div className="relative w-full xl:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <input
                  type="search"
                  placeholder={t("shanci_kutir")}
                  value={shanciKutirSearch}
                  onChange={(e) => {
                    setShanciKutirSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 h-[38px] bg-transparent border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total") || "Total"}: <span className="font-semibold text-foreground">{data?.count || 0}</span>
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
                       <Package className="h-3.5 w-3.5 text-primary" />
                       Job Card
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
                      <Package className="h-3.5 w-3.5 text-primary" />
                      {t("organization")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Car className="h-3.5 w-3.5 text-primary" />
                      {t("vehicle_model")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("shanci_kutir")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("targa_kutir")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      {t("customer_phone")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      {t("total_amount")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("date")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
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
                      {Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.results?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.results?.map((request) => (
                    <TableRow key={request.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{request.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                         <Button
                          variant="link"
                          className="p-0 h-auto font-semibold text-blue-600 hover:text-primary transition-colors hover:underline"
                          onClick={() => handleViewDetails(request.id)}
                        >
                          {request.job_card}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold  hover:text-primary transition-colors text-blue-600 hover:underline"
                          onClick={() => handleViewDetails(request.id)}
                        >
                          {request.customer_name}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{request.customer_organization || "N/A"}</TableCell>
                      <TableCell className="font-medium text-foreground">{request.vehicle_model}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{request.vehicle_shanci_kutir}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{request.vehicle_targa_kutir}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{request.customer_phone}</TableCell>
                      <TableCell className="font-bold text-foreground">
                        {request.total_amount ? `${formatCurrency(request.total_amount)} ETB` : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-nowrap">{formatDateTypeStamp(request.ken)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(request.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{request.user}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(request.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDetails(request.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeletePartRequest(request.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive cursor-pointer">
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
                 <div key={i} className="bg-card border rounded-xl p-4 space-y-4 animate-pulse">
                   <div className="flex justify-between items-center">
                      <div className="h-4 w-20 bg-muted rounded"></div>
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                   </div>
                   <div className="h-6 w-48 bg-muted rounded"></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                   </div>
                 </div>
               ))
            ) : data?.results?.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                 <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-6 w-6" />
                 </div>
                 <p className="font-medium text-muted-foreground">{t("no_record_found")}</p>
              </div>
            ) : (
              data?.results?.map((request) => (
                <div key={request.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{request.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{request.customer_name}</h3>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("organization")}</span>
                        <p className="font-medium text-sm text-foreground">{request.customer_organization || "N/A"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleViewDetails(request.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(request.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeletePartRequest(request.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors cursor-pointer">
                          <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                            <Trash2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-sm">{t("delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                   <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="space-y-1 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Job Card ID</span>
                      <div className="text-sm font-semibold text-foreground truncate">{request.job_card || "N/A"}</div>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("vehicle_model")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{request.vehicle_model}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("shanci_kutir")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{request.vehicle_shanci_kutir}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("targa_kutir")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{request.vehicle_targa_kutir}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("customer_phone")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{request.customer_phone}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("total_amount")}</span>
                      <div className="text-sm font-bold text-foreground truncate">{request.total_amount ? `${formatCurrency(request.total_amount)} ETB` : "N/A"}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() =>
                      setExpandedCards((prev) => {
                        const isCurrentlyExpanded = prev[request.id];
                        return isCurrentlyExpanded ? {} : { [request.id]: true };
                      })
                    }
                    className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
                  >
                    {expandedCards[request.id] ? (
                      <>
                        <span className="font-medium">{t("hide_details")}</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{t("show_details")}</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {expandedCards[request.id] && (
                    <div className="mt-3 pt-3 border-t space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("date")}</span>
                        <span className="text-xs font-semibold text-foreground">{formatDateTypeStamp(request.ken) || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                           <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                              {(request.user || "U").substring(0, 2).toUpperCase()}
                           </div>
                           <span className="text-[10px] font-medium text-muted-foreground">{request.user}</span>
                        </div>
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
                onClick={() => handlePageChange(page - 1)}
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
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                 {t("next")}
                <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </div>

          {isError && (
            <p className="mt-4 text-red-500 font-bold text-center">
              {t("Failed to load part requests. Please try again.")}
            </p>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeletePartRequest}
      />
    </div>
  );
};

export default ManagePartRequest;

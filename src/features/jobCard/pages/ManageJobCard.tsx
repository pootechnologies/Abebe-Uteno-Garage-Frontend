import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  Search, 
  Hash, 
  UserCircle, 
  Car,
  Building2,
  CreditCard,
  Target,
  Banknote,
  Gauge,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp.ts";
import { getJobCards, deleteJobCard, getAllCustomers } from "../api/jobCard.ts";
import { t } from "i18next";
import Select from "react-select";
import { formatCurrency } from "@/utils/numberFormaterStats.ts";

const PAGE_SIZE = 10;

const ManageJobCard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobCardToDelete, setJobCardToDelete] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(null);

  // Fetch all customers for the dropdown
  const { data: allCustomers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
  });

  // Fetch job cards with search parameter
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobCards", page, selectedOption?.value],
    queryFn: () => getJobCards(page, selectedOption?.value),
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    onError: () => toast.error("Failed to load job card"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobCards"] });
      toast.success("Job card deleted successfully");
    },
    onError: () => toast.error("Failed to delete job card"),
  });

  // Prepare options for react-select
  const customerOptions = allCustomers.map((customer: any) => ({
    value: customer.name,
    label: customer.organization || customer.name,
  }));

  const handleViewDetails = (id: number) => navigate(`/job-card/${id}`);
  const handleUpdateJobCard = (id: number) => navigate(`/update-job-card/${id}`);

  const handleDeleteJobCard = (id: number) => {
    setJobCardToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteJobCard = async () => {
    if (jobCardToDelete === null) return;
    try {
      await deleteMutation.mutateAsync(jobCardToDelete);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const sortedJobCards = data?.results ? [...data.results] : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            {t("manage_job_cards")}
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
                    })
                  }}
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total_job_card") || "Total"}: <span className="font-semibold text-foreground">{data?.count || 0}</span>
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
                      {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
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
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {t("vehicle_plate")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      {t("status")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <Gauge className="h-3.5 w-3.5 text-primary" />
                      {t("mileage")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 text-primary" />
                      {t("total_cost")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("registed_date")}
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
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sortedJobCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found") || "No job cards found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedJobCards.map((jobCard) => (
                    <TableRow key={jobCard.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{jobCard.id}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold text-blue-600 hover:text-primary transition-colors hover:underline"
                          onClick={() => handleViewDetails(jobCard.id)}
                        >
                          {jobCard.customer_name}
                        </Button>
                      </TableCell>
                      <TableCell className="font-bold text-muted-foreground">
                        {jobCard.organization || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{jobCard.vehicle_model}</TableCell>
                      <TableCell className="font-medium text-foreground">{jobCard.vehicle_plate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          jobCard.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {jobCard.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{jobCard.odometer_reading}</TableCell>
                      <TableCell className="font-semibold text-foreground">{jobCard.total_cost ? formatCurrency(jobCard.total_cost) : "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTypeStamp(jobCard.service_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(jobCard.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{jobCard.user}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(jobCard.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateJobCard(jobCard.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteJobCard(jobCard.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive cursor-pointer">
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
            ) : sortedJobCards.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_record_found") || "No job cards found"}</p>
              </div>
            ) : (
              sortedJobCards.map((jobCard) => (
                <div key={jobCard.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{jobCard.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-blue-600 group-hover:text-primary transition-colors leading-tight">{jobCard.customer_name}</h3>
                      </div>
                      {jobCard.organization && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">{jobCard.organization}</span>
                        </div>
                      )}
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
                        <DropdownMenuItem onClick={() => handleViewDetails(jobCard.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateJobCard(jobCard.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeleteJobCard(jobCard.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors cursor-pointer">
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
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("vehicle_model")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{jobCard.vehicle_model}</div>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("vehicle_plate")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{jobCard.vehicle_plate}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("status")}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        jobCard.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {jobCard.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("mileage")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{jobCard.odometer_reading}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("total_cost")}</span>
                      <div className="text-sm font-semibold text-foreground">{jobCard.total_cost ? formatCurrency(jobCard.total_cost) : "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("registed_date")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{formatDateTypeStamp(jobCard.service_date)}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(jobCard.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{jobCard.user}</span>
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
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous") || "Previous"}
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
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                {t("next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isError && (
            <p className="mt-4 text-red-500 font-bold text-center">
              {t("failed_to_load_job_cards_try_again")}
            </p>
          )}

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={confirmDeleteJobCard}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageJobCard;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
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
  ChevronLeft, 
  ChevronRight,
  Search,
  Hash,
  UserCircle,
  Car,
  Calendar,
  Info,
  ClipboardList,
  Contact
} from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  deleteOrderVoucher,
  getOrderVouchers,
  getAllCustomers,
} from "@/features/vehicleOrderVoucher/api/vehicleOrderVocher";
import { useNavigate } from "react-router-dom";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import Select from "react-select";
import { t } from "i18next";

interface Customer {
  id: number;
  name: string;
}

interface Voucher {
  id: number;
  job_card: string;
  customer_name: string;
  vehicle_model: string;
  vehicle_shanci_kutir: string;
  asrekabi_name: string;
  terekabi_name: string;
  ken: string;
  user: string;
}

interface VoucherResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Voucher[];
}

const PAGE_SIZE = 10;

const ManageVehicleOrderVoucher = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);

  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [shanciKutirSearch, setShanciKutirSearch] = useState("");

  const { data: allCustomers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
  });

  const searchValue =
    shanciKutirSearch.trim() !== ""
      ? shanciKutirSearch
      : selectedOption?.value || "";

  const { data, isLoading, isError, refetch } = useQuery<VoucherResponse>({
    queryKey: ["vehicleOrderVoucher", page, searchValue],
    queryFn: () => getOrderVouchers(page, searchValue),
  });

  const customerOptions = allCustomers.map((customer) => ({
    value: customer.name,
    label: customer.name,
  }));

  const handleViewDetails = (id: number) => {
    navigate(`/vehicle-order-voucher-detail/${id}`);
  };

  const handleUpdateDetails = (voucher: Voucher) => {
    navigate(`/update-vehicle-order-voucher/${voucher.id}`);
  };

  const handleDeleteVoucher = (id: number) => {
    setVoucherToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVoucher = () => {
    if (voucherToDelete === null) return;
    deleteOrderVoucher(voucherToDelete)
      .then(() => {
        refetch();
        setIsDeleteModalOpen(false);
        toast.success(t("Vehicle order voucher deleted successfully!"));
      })
      .catch(() => toast.error(t("Failed to delete vehicle order voucher.")));
  };

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const sortedVouchers = data?.results ? [...data.results] : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("manage_vehicle_order_vouchers")}
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
                      <ClipboardList className="h-3.5 w-3.5 text-primary" />
                      {t("job_card_id")}
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
                      <Contact className="h-3.5 w-3.5 text-primary" />
                      {t("asrekabi_sim")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Contact className="h-3.5 w-3.5 text-primary" />
                      {t("terekabi_sim")}
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
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sortedVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVouchers.map((voucher) => (
                    <TableRow key={voucher.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{voucher.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{voucher.job_card || "N/A"}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                          onClick={() => handleViewDetails(voucher.id)}
                        >
                          {voucher.customer_name}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{voucher.vehicle_model}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{voucher.vehicle_shanci_kutir}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{voucher.asrekabi_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{voucher.terekabi_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-nowrap">{formatDateTypeStamp(voucher.ken)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(voucher.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{voucher.user}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(voucher.id)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDetails(voucher)} className="gap-3 rounded-lg px-2 py-2.5 cursor-pointer">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteVoucher(voucher.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive cursor-pointer">
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
            ) : sortedVouchers.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                 <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-6 w-6" />
                 </div>
                 <p className="font-medium text-muted-foreground">{t("no_vehicle_order_vouchers_found")}</p>
              </div>
            ) : (
              sortedVouchers.map((voucher) => (
                <div key={voucher.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{voucher.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{voucher.customer_name}</h3>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(voucher.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(voucher)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors cursor-pointer">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeleteVoucher(voucher.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors cursor-pointer">
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
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("job_card_id")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{voucher.job_card || "N/A"}</div>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("vehicle_model")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{voucher.vehicle_model}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("shanci_kutir")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{voucher.vehicle_shanci_kutir}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("asrekabi_sim")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{voucher.asrekabi_name}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("terekabi_sim")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{voucher.terekabi_name}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("date")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{formatDateTypeStamp(voucher.ken)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                         <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                            {(voucher.user || "U").substring(0, 2).toUpperCase()}
                         </div>
                         <span className="text-[10px] font-medium text-muted-foreground">{voucher.user}</span>
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
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
              Failed to load vehicle order vouchers. Try again.
            </p>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteVoucher}
      />
    </div>
  );
};

export default ManageVehicleOrderVoucher;
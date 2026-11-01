// @ts-nocheck
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, FileText, Pencil, Trash2, Search, Hash, UserCircle, ChevronLeft, ChevronRight, Info, Car, FileDigit, Calendar, ClipboardCheck, Building2 } from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  deleteVehicleAcceptance,
  getVehicleAcceptances,
  getAllCustomers,
} from "../api/vehicleAcceptance";
import { pdf } from "@react-pdf/renderer";
import PdfDocument from "../components/PdfDocument";
import axios from "axios";
import axiosInstance from "@/api/axios.tsx";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.ts";
import Select from "react-select";
import { t } from "i18next";

const PAGE_SIZE = 10;

const ManageVehicleAcceptance = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleAcceptanceToDelete, setVehicleAcceptanceToDelete] = useState<number | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<string | null>(null);
  const [shanciKutirSearch, setShanciKutirSearch] = useState("");

  // Fetch all customers
  const { data: allCustomers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
  });

  // Compute combined search value
  const searchValue =
    shanciKutirSearch.trim() !== ""
      ? shanciKutirSearch
      : selectedSearch || "";

  // Fetch vehicle acceptances
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vehicleAcceptances", page, searchValue],
    queryFn: () => getVehicleAcceptances(page, searchValue),
    onError: () => toast.error("Failed to load vehicle acceptances"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicleAcceptance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleAcceptances"] });
      toast.success("Vehicle Acceptance deleted successfully!");
    },
    onError: () => toast.error("Failed to delete vehicle acceptance."),
  });

  const customerOptions = allCustomers.map((customer) => ({
    value: customer.name,
    label: customer.organization || customer.name,
  }));

  const handleDeleteVehicleAcceptance = (id: number) => {
    setVehicleAcceptanceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVehicleAcceptance = async () => {
    if (vehicleAcceptanceToDelete === null) return;
    try {
      await deleteMutation.mutateAsync(vehicleAcceptanceToDelete);
      setIsDeleteModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/vehicle-acceptance/${id}`);
  };

  const handleUpdateDetails = (id: number) => {
    navigate(`/update-vehicle-acceptance/${id}`);
  };

  const handlePageChange = (value: number) => setPage(value);

  const handleViewReceipt = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const vehicleRes = await axiosInstance.get(`api/garage/acceptance/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const companyRes = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COMPANY}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await pdf(
        <PdfDocument vehicleAcceptance={vehicleRes.data} companyData={companyRes.data[0]} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    }
  };



  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            {t("manage_vehicle_acceptance")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
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
              onChange={(option) => {
                setSelectedSearch(option?.value || null);
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
                }),
              }}
            />
          </div>

          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="search"
              placeholder={t("shanci_kutir")}
              value={shanciKutirSearch}
              onChange={(e) => {
                setShanciKutirSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-[38px] pl-10 pr-4 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {t("total_items") || "Total Items"}: <span className="font-semibold text-foreground">{data?.count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[80px] font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-foreground" />
                  {t("id")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-3.5 w-3.5 text-foreground" />
                  {t("ye_bale_nibret_sim")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-foreground" />
                  {t("organization")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Car className="h-3.5 w-3.5 text-foreground" />
                  {t("model")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <FileDigit className="h-3.5 w-3.5 text-foreground" />
                  {t("shanci_kutir")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <FileDigit className="h-3.5 w-3.5 text-foreground" />
                  {t("motor_kutir")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-foreground" />
                  {t("ken")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-3.5 w-3.5 text-foreground" />
                  {t("created_by")}
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">{t("action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24">
                  <Spinner className="mx-auto" />
                </TableCell>
              </TableRow>
            ) : !data?.results || data.results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground font-medium">
                  {t("no_records_found") || "No vehicle acceptances found"}
                </TableCell>
              </TableRow>
            ) : (
              data.results.map((vehicleAcceptance) => (
                <TableRow key={vehicleAcceptance.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-medium">#{vehicleAcceptance.id}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewDetails(vehicleAcceptance.id)}
                      className="text-blue-600 hover:text-primary hover:underline font-semibold transition-colors"
                    >
                      {vehicleAcceptance.customer_name}
                    </button>
                  </TableCell>
                  <TableCell className="font-bold text-muted-foreground">
                    {vehicleAcceptance.organization || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{vehicleAcceptance.vehicle_model}</TableCell>
                  <TableCell className="text-muted-foreground">{vehicleAcceptance.vehicle_shanci_kutir}</TableCell>
                  <TableCell className="text-muted-foreground">{vehicleAcceptance.vehicle_motor_kutir}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(vehicleAcceptance.ken).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                        {(vehicleAcceptance.user || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{vehicleAcceptance.user}</span>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewReceipt(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2.5">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t("view_receipt")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Pencil className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteVehicleAcceptance(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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

      {/* Mobile View: Cards */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {data?.results?.map((vehicleAcceptance) => (
          <div
            key={vehicleAcceptance.id}
            className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{vehicleAcceptance.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("ye_bale_nibret_sim")}</span>
                  <button onClick={() => handleViewDetails(vehicleAcceptance.id)} className="font-bold text-lg text-foreground hover:text-primary transition-colors leading-tight text-left">
                    {vehicleAcceptance.customer_name}
                  </button>
                </div>
                {vehicleAcceptance.organization && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground">{vehicleAcceptance.organization}</span>
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
                  <DropdownMenuItem onClick={() => handleViewDetails(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                      <Eye className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">{t("view")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewReceipt(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">{t("view_receipt")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateDetails(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                    <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">{t("update")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-muted/50" />
                  <DropdownMenuItem onClick={() => handleDeleteVehicleAcceptance(vehicleAcceptance.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
                    <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                      <Trash2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-bold text-sm">{t("delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("model")}</span>
                <span className="font-semibold text-sm text-foreground">{vehicleAcceptance.vehicle_model || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("shanci_kutir")}</span>
                <span className="font-semibold text-sm text-foreground">{vehicleAcceptance.vehicle_shanci_kutir || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("motor_kutir")}</span>
                <span className="font-semibold text-sm text-foreground">{vehicleAcceptance.vehicle_motor_kutir || "N/A"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("ken")}</span>
                <span className="font-semibold text-sm text-foreground">{new Date(vehicleAcceptance.ken).toLocaleDateString() || "N/A"}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-muted/50">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("created_by")}</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                    {(vehicleAcceptance.user || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{vehicleAcceptance.user || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {data?.results?.length === 0 && (
          <div className="bg-card border rounded-xl p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
              <Info className="h-6 w-6" />
            </div>
            <p className="font-medium text-muted-foreground">{t("no_records_found") || "No vehicle acceptances found"}</p>
          </div>
        )}
      </div>

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
                    className={`h-8 w-8 rounded-lg ${page === pageNum ? 'default' : 'ghost'}`}
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

      {isError && <p className="mt-4 text-red-500">{t("failed_to_load_vehicle_acceptances")}</p>}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteVehicleAcceptance}
      />
        </div>
      </div>
    </div>
  );
};

export default ManageVehicleAcceptance;

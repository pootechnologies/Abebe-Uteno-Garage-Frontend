import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getVehicles,
  getAllVehicles,
  useDeleteVehicle,
  useUpdateVehicle,
} from "../api/vehicle.ts";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVertical,
  Car,
  Search,
  Hash,
  UserCircle,
  Palette,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  Info,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ViewVehicleModal from "../components/ViewVehicleModal.tsx";
import UpdateVehicleModal from "../components/UpdateVehicleModal.tsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.tsx";
import Select from "react-select";
import axiosInstanceOld from "@/api/axiosOld";
import { API_ENDPOINTS } from "@/utils/apiConfig";

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

const ManageVehicles = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(null);
  const [shanciKutirSearch, setShanciKutirSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const [customers, setCustomers] = useState<{ value: number; label: string; name: string; organization: string }[]>([]);

  const [formData, setFormData] = useState<any>({
    customer_name: "",
    license_plate: "",
    motor_kutir: "",
    shanci_kutir: "",
    model: "",
    year: "",
    user: "",
    customer: "",
    image: null,
  });

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstanceOld.get(`${API_ENDPOINTS.CUSTOMERS}?include_all=True`);
        setCustomers(
          response.data.all_results.map((customer: any) => ({
            value: customer.id,
            label: customer.organization,
            name: customer.name,
            organization: customer.organization,
          })),
        );
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const { data: allVehicles = [], isLoading: isLoadingAllVehicles } = useQuery({
    queryKey: ["allVehicles"],
    queryFn: getAllVehicles,
  });

  const searchValue = shanciKutirSearch.trim() !== ""
    ? shanciKutirSearch
    : selectedOption?.value || "";

  const { data: response, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ["vehicles", page, pageSize, searchValue],
    queryFn: () => getVehicles(page, pageSize, searchValue),
  });

  const totalPages = Math.ceil((response?.count || 0) / pageSize);

  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const { mutate: updateVehicle, isPending: isUpdating } = useUpdateVehicle();

  // Use customers for vehicleOptions
  const vehicleOptions = customers.map((customer) => ({
    value: customer.organization,
    label: customer.organization,
  }));

  const sortedVehicles = response?.results
    ? [...response.results].sort((a, b) => b.id - a.id)
    : [];

  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  const handleUpdateDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFormData({
      customer_name: vehicle.customer_name || "",
      license_plate: vehicle.license_plate,
      motor_kutir: vehicle.motor_kutir,
      shanci_kutir: vehicle.shanci_kutir,
      model: vehicle.model,
      year: vehicle.year || 0,
      user: vehicle.user,
      customer: vehicle.customer,
      image: vehicle.image || null,
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    setVehicleToDelete(vehicleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteVehicle = () => {
    if (vehicleToDelete === null) return;
    deleteVehicle(vehicleToDelete, {
      onSuccess: () => {
        refetch();
        setIsDeleteModalOpen(false);
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const dataToSubmit = {
      ...formData,
      image: formData.image || selectedVehicle.image,
    };

    updateVehicle(
      { id: selectedVehicle.id, ...dataToSubmit },
      {
        onSuccess: () => {
          setIsUpdateModalOpen(false);
          refetch();
        },
      }
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Car className="h-6 w-6" />
            </div>
            {t("manage_vehicles")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={vehicleOptions}
                  isClearable
                  placeholder={t("search_by_customer_name")}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option: any) => {
                    setSelectedOption(option);
                    setPage(1);
                  }}
                  isLoading={isLoadingAllVehicles}
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

              <div className="relative w-full xl:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <input
                  type="search"
                  placeholder={t("shanci_kutir_motor")}
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
                  {t("total_vehicles")}: <span className="font-semibold text-foreground">{response?.count || 0}</span>
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
                      {t("customer")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    {t("organization")}
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {t("license_plate")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-primary" />
                      {t("motor_kutir")}
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
                      <Car className="h-3.5 w-3.5 text-primary" />
                      {t("model")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("year")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("recorded_by")}
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
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : sortedVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_vehicles_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{vehicle.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{vehicle.customer_name || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.organization || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.license_plate || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.motor_kutir}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.shanci_kutir}</TableCell>
                      <TableCell className="font-medium text-foreground">{vehicle.model}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{vehicle.year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(vehicle.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{vehicle.user}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(vehicle)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDetails(vehicle)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteVehicle(vehicle.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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
            ) : sortedVehicles.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_vehicles_found")}</p>
              </div>
            ) : (
              sortedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{vehicle.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{vehicle.customer_name || "-"}</h3>
                        <span className="text-xs text-muted-foreground">{vehicle.organization || "-"}</span>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(vehicle)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(vehicle)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeleteVehicle(vehicle.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
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
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("id")}</span>
                      <div className="text-sm font-semibold text-foreground">#{vehicle.id}</div>
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("customer")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{vehicle.customer_name}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("license_plate")}</span>
                      <div className="text-sm font-semibold text-foreground">
                        {vehicle.license_plate}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("model")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{vehicle.model}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("shanci_kutir")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{vehicle.shanci_kutir}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("motor_kutir")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{vehicle.motor_kutir}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("year")}</span>
                      <div className="text-sm font-semibold text-foreground">{vehicle.year}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("recorded_by")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(vehicle.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{vehicle.user}</span>
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
            <p className="mt-4 text-red-500 font-bold text-center">{t("failed_to_load_vehicles")}</p>
          )}

          <ViewVehicleModal
            isOpen={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            vehicle={selectedVehicle}
          />

          <UpdateVehicleModal
            isOpen={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            vehicle={selectedVehicle}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleUpdateSubmit}
            setFormData={setFormData}
            isUpdating={isUpdating}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={confirmDeleteVehicle}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageVehicles;
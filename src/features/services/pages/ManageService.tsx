import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  updateService,
  deleteService,
} from "../api/services";
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
  Search,
  Hash,
  UserCircle,
  FileText,
  Banknote,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { ViewServiceModal } from "../components/ViewServiceModal";
import { UpdateServiceModal } from "../components/UpdateServiceModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import Select from "react-select";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useTranslation } from "react-i18next";
import products from "../../../products.json";

interface Service {
  id: number;
  name: string;
  description: string;
  cost: string;
  duration: string;
  user: string;
  part_number?: string | null;
  product?: number | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Service[];
}

const ManageServices = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    duration: "",
  });

  // Fetch services for the DataGrid (with search parameter and pagination)
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse>({
    queryKey: ["services", selectedOption?.label, currentPage],
    queryFn: () => getServices(selectedOption?.label, currentPage),
  });

  const services = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const hasNextPage = paginatedData?.next !== null;
  const hasPreviousPage = paginatedData?.previous !== null;

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, serviceData }: { id: number; serviceData: any }) => updateService(id, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("service updated successfully");
      setIsUpdating(false);
      setIsUpdateModalOpen(false);
    },
    onError: () => {
      toast.error(t("failed_to_update_service"));
      setIsUpdating(false);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("service deleted successfully");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    },
    onError: () => {
      toast.error(t("failed_to_delete_service"));
      setIsDeleting(false);
    },
  });

  // Prepare unique product description options for react-select
  const serviceOptions = [...new Set(products.map((product) => product.description))].map(
    (description) => ({ value: description, label: description }),
  );

  const handleViewDetails = (service: any) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const handleUpdateDetails = (service: any) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      cost: service.cost || "",
      duration: service.duration || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteService = (serviceId: number) => {
    setServiceToDelete(serviceId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete === null) return;
      setIsDeleting(true);
    deleteServiceMutation.mutate(serviceToDelete);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = (updatedData: any) => {
    if (!selectedService) return;
      setIsUpdating(true);
    updateServiceMutation.mutate({
      id: selectedService.id,
      serviceData: updatedData,
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const displayServices = services;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            {t("manage_services")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={serviceOptions}
                  isClearable
                  placeholder={t("search_services")}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option: any) => {
                    setSelectedOption(option);
                    setCurrentPage(1);
                  }}
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
                  {t("total_services") || "Total Services"}: <span className="font-semibold text-foreground">{totalCount || 0}</span>
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
                      <Hash className="h-3.5 w-3.5 text-foreground" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-foreground" />
                      {t("name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-foreground" />
                      {t("description")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 text-foreground" />
                      {t("cost")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-foreground" />
                      {t("duration")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <UserCircle className="h-3.5 w-3.5 text-foreground" />
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
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : displayServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found") || "No services found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayServices.map((service: any) => (
                    <TableRow key={service.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{service.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{service.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={service.description}>
                        {service.description || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(Number(service.cost)) || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{service.duration || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(service.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{service.user || "System"}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(service)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Eye className="h-4 w-4 text-foreground" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDetails(service)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteService(service.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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
            ) : displayServices.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_services_found") || "No services found"}</p>
              </div>
            ) : (
              displayServices.map((service: any) => (
                <div key={service.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{service.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{service.name}</h3>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                          < MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleViewDetails(service)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                          <div className="p-1.5 bg-muted text-foreground rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(service)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeleteService(service.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
                          <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                            <Trash2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-sm">{t("delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("description")}</span>
                      <div className="text-sm font-semibold text-foreground">{service.description || "N/A"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("cost")}</span>
                      <div className="text-sm font-semibold text-foreground">
                        {formatCurrency(Number(service.cost)) || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("duration")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{service.duration || "N/A"}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(service.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{service.user || "System"}</span>
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!hasPreviousPage}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!hasNextPage}
                className="gap-2 rounded-lg"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isError && (
        <p className="mt-4 text-red-500 font-bold text-center">{t("failed_to_load_services")}</p>
      )}

      <ViewServiceModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        service={selectedService}
      />

      <UpdateServiceModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        service={selectedService}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdateSubmit}
        isUpdating={isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteService}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageServices;

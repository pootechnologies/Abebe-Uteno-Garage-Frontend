import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import Select from "react-select";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useTranslation } from "react-i18next";
import {
  getServicePackages,
  updateServicePackage,
  deleteServicePackage,
} from "../api/servicePackage";
import { ViewServicePackageModal } from "../components/ViewServicePackageModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { UpdateServicePackageModal } from "../components/UpdateServicePackageModal";

interface ServicePackage {
  id: number;
  name: string;
  description: string;
  cost: string;
  duration: string;
  user: string;
}

const ManageServicePackages = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [selectedServicePackage, setSelectedServicePackage] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [servicePackageToDelete, setServicePackageToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    duration: "",
  });

  // Fetch service packages
  const {
    data: servicePackages = [],
    isLoading,
    isError,
  } = useQuery<ServicePackage[]>({
    queryKey: ["servicePackages"],
    queryFn: getServicePackages,
  });

  // Filter based on selected option from react-select
  const filteredServicePackages = selectedOption 
    ? servicePackages.filter((pkg: ServicePackage) => pkg.id === selectedOption.value) 
    : servicePackages;

  const updateServicePackageMutation = useMutation({
    mutationFn: ({ id, ...servicePackageData }: { id: number } & any) => updateServicePackage(id, servicePackageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      toast.success("Service package updated successfully");
    },
    onError: () => {
      toast.error(t("update_failed"));
    },
  });

  const deleteServicePackageMutation = useMutation({
    mutationFn: deleteServicePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      toast.success("Service package deleted successfully");
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    },
    onError: () => {
      toast.error(t("delete_failed"));
      setIsDeleting(false);
    },
  });

  // Prepare options for react-select
  const servicePackageOptions = servicePackages.map((pkg: ServicePackage) => ({
    value: pkg.id,
    label: pkg.name,
  }));

  const handleViewDetails = (servicePackage: ServicePackage) => {
    setSelectedServicePackage(servicePackage);
    setIsViewModalOpen(true);
  };

  const handleUpdateDetails = (servicePackage: ServicePackage) => {
    setSelectedServicePackage(servicePackage);
    setFormData({
      name: servicePackage.name,
      description: servicePackage.description || "",
      cost: servicePackage.cost || "",
      duration: servicePackage.duration || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteServicePackage = (servicePackageId: number) => {
    setServicePackageToDelete(servicePackageId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteServicePackage = () => {
    if (servicePackageToDelete === null) return;
    setIsDeleting(true);
    deleteServicePackageMutation.mutate(servicePackageToDelete);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (updatedData: any) => {
    if (!selectedServicePackage) return;
    await updateServicePackageMutation.mutateAsync({
      id: selectedServicePackage.id,
      ...updatedData,
    });
    setIsUpdateModalOpen(false);
  };

  const pageCount = Math.ceil(filteredServicePackages.length / itemsPerPage);
  const totalPages = pageCount;
  const displayServicePackages = filteredServicePackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            {t("manage_service_package")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={servicePackageOptions}
                  isClearable
                  placeholder={t("search") || "Search service packages"}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option: any) => {
                    setSelectedOption(option);
                    setCurrentPage(1);
                  }}
                  isLoading={isLoading}
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
                  {t("total_service_package") || "Total"}: <span className="font-semibold text-foreground">{filteredServicePackages.length || 0}</span>
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
                ) : displayServicePackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found") || "No service packages found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayServicePackages.map((servicePackage: ServicePackage) => (
                    <TableRow key={servicePackage.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{servicePackage.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{servicePackage.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={servicePackage.description}>
                        {servicePackage.description || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(Number(servicePackage.cost)) || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{servicePackage.duration || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(servicePackage.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{servicePackage.user || "System"}</span>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(servicePackage)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Eye className="h-4 w-4 text-foreground" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDetails(servicePackage)} className="gap-3 rounded-lg px-2 py-2.5">
                              <Pencil className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem onClick={() => handleDeleteServicePackage(servicePackage.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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
            ) : displayServicePackages.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_records_found") || "No service packages found"}</p>
              </div>
            ) : (
              displayServicePackages.map((servicePackage: ServicePackage) => (
                <div key={servicePackage.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{servicePackage.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{servicePackage.name}</h3>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(servicePackage)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                          <div className="p-1.5 bg-muted text-foreground rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(servicePackage)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Pencil className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem onClick={() => handleDeleteServicePackage(servicePackage.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
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
                      <div className="text-sm font-semibold text-foreground">{servicePackage.description || "N/A"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("cost")}</span>
                      <div className="text-sm font-semibold text-foreground">
                        {formatCurrency(Number(servicePackage.cost)) || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("duration")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{servicePackage.duration || "N/A"}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(servicePackage.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{servicePackage.user || "System"}</span>
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
                disabled={currentPage === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous") || "Previous"}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages) {
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                {t("next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isError && (
        <p className="mt-4 text-red-500 font-bold text-center">{t("load_failed_try_again")}</p>
      )}

      <ViewServicePackageModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        servicePackage={selectedServicePackage}
      />

      <UpdateServicePackageModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        servicePackage={selectedServicePackage}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdateSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteServicePackage}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageServicePackages;

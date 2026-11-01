import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers, deleteSupplier, updateSupplier } from "../api/supplier";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MoreVertical, 
  Search, 
  UserCircle, 
  Phone, 
  Fingerprint, 
  Hash, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Eye, 
  Pencil, 
  Trash2,
  Truck
} from "lucide-react";
import { useState, useEffect } from "react";
import ViewSupplierModal from "../components/ViewSupplierModal";
import UpdateSupplierModal from "../components/UpdateSupplierModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
interface Supplier {
  id: number;
  name: string;
  contact_info: string | null;
  tin_number: string | null;
  user: string;
}

const supplierUpdateSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact_info: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: "Contact info must be 10 digits",
    }),
  tin_number: z.string().optional(),
});

const ManageSupplier = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);

  const {
    data: allSuppliers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supplierUpdateSchema),
  });

  useEffect(() => {
    if (selectedSupplier) {
      setValue("name", selectedSupplier.name);
      setValue("contact_info", selectedSupplier.contact_info || "");
      setValue("tin_number", selectedSupplier.tin_number || "");
    }
  }, [selectedSupplier, setValue]);

  const filteredSuppliers = allSuppliers.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSelect = selectedOption ? s.id === selectedOption.value : true;
    return matchesSearch && matchesSelect;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const displaySuppliers = filteredSuppliers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const supplierOptions = allSuppliers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleUpdateDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteSupplier = (supplierId: number) => {
    setSupplierToDelete(supplierId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSupplier = async () => {
    if (supplierToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteSupplier(supplierToDelete);
      refetch();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedSupplier) return;
    setIsUpdating(true);
    try {
      await updateSupplier(selectedSupplier.id, data);
      setIsUpdateModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to update supplier:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Truck className="h-6 w-6" />
            </div>
            {t("manage_suppliers")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">

      {/* Toolbar / Search Section */}
      <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
            <Select
              options={supplierOptions}
              placeholder={t("search_suppliers...")}
              isClearable
              className="w-full react-select-container"
              classNamePrefix="react-select"
              isLoading={isLoading}
              onChange={(option: any) => {
                setSelectedOption(option);
                setPage(1);
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
                {t("total_suppliers") || "Total Suppliers"}: <span className="font-semibold text-foreground">{filteredSuppliers.length}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  {t("id")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-3.5 w-3.5 text-primary" />
                  {t("supplier_name")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {t("contact_info")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-3.5 w-3.5 text-primary" />
                  {t("tin_number")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2 text-nowrap">
                  <UserCircle className="h-3.5 w-3.5 text-primary" />
                  {t("created_by")}
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j} className="h-16">
                      <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">
                  {t("no_suppliers_found") || "No suppliers found"}
                </TableCell>
              </TableRow>
            ) : (
              displaySuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-medium">#{supplier.id}</TableCell>
                  <TableCell className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {supplier.name}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{supplier.contact_info || "-"}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {supplier.tin_number || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                        {(supplier.user || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{supplier.user}</span>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(supplier)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateDetails(supplier)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Pencil className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center space-y-3">
             <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                <Info className="h-6 w-6" />
             </div>
             <p className="font-medium text-muted-foreground">{t("no_suppliers_found") || "No suppliers found"}</p>
          </div>
        ) : (
          displaySuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{supplier.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("supplier_name")}</span>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{supplier.name}</h3>
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
                    <DropdownMenuItem onClick={() => handleViewDetails(supplier)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                        <Eye className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm">{t("view")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateDetails(supplier)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                      <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm">{t("update")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-muted/50" />
                    <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
                      <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-sm">{t("delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

               <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("contact_info")}</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="h-3 w-3 text-primary/70 shrink-0" />
                    <span className="truncate">{supplier.contact_info || "-"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("tin_number")}</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Fingerprint className="h-3 w-3 text-primary/70 shrink-0" />
                    <span className="truncate">{supplier.tin_number || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("recorded_by")}</span>
                  <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                      {(supplier.user || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{supplier.user}</span>
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

      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        supplier={selectedSupplier}
      />

      <UpdateSupplierModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        onSubmit={handleSubmit(handleUpdateSubmit)}
        register={register}
        errors={errors}
        isUpdating={isUpdating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteSupplier}
        isDeleting={isDeleting}
      />
        </div>
      </div>
    </div>
  );
};

export default ManageSupplier;

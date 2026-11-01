import { useQuery } from "@tanstack/react-query";
import { deleteCustomer, getCustomers, updateCustomer } from "../api/customer";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Fingerprint, 
  UserCircle,
  Hash,
  ChevronLeft,
  ChevronRight,
  Info,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { useState } from "react";
import ViewCustomerModal from "../components/ViewCustomerModal";
import UpdateCustomerModal from "../components/UpdateCustomerModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { t } from "i18next";
import { getAllCustomers } from "../api/customer";

interface Customer {
  id: number;
  name: string;
  organization: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  tin_number: string | null;
  user: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

const ManageCustomer = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["customers", page, pageSize, searchTerm],
    queryFn: () => getCustomers(page, pageSize, searchTerm),
    onError: () => toast.error("Failed to load customers"),
  });

  const {
    data: allCustomers,
    isLoading: isLoadingAllCustomers,
  } = useQuery({
    queryKey: ["allCustomers"],
    queryFn: getAllCustomers,
    onError: () => toast.error("Failed to load all customers"),
  });

  const totalCount = response?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const customers = Array.isArray(response?.results)
    ? [...response.results].sort((a, b) => b.id - a.id)
    : [];

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    organization: "",
    tin_number: "",
  });

  const customerOptions = allCustomers
    ? allCustomers.map((customer) => ({
      value: customer.id,
      label: customer.organization || customer.name,
    }))
    : [];

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleUpdateDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      organization: customer.organization || "",
      tin_number: customer.tin_number || "",
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteCustomer = async (customerId: number) => {
    setCustomerToDelete(customerId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete);
      toast.success("Customer deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete customer");
      console.error("Failed to delete customer:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsUpdating(true);
    try {
      await updateCustomer(selectedCustomer.id, formData);
      toast.success("Customer updated successfully");
      setIsUpdateModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update customer");
      console.error("Failed to update customer:", error);
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
              <Users className="h-6 w-6" />
            </div>
            {t("manage_customers")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">

      {/* Toolbar / Search Section */}
      <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Select
              options={customerOptions}
              placeholder={t("search_customers")}
              isClearable
              className="w-full react-select-container"
              classNamePrefix="react-select"
              isLoading={isLoadingAllCustomers}
              onChange={(selectedOption: any) => {
                setSearchTerm(selectedOption?.label || "");
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
                {t("total_customers")}: <span className="font-semibold text-foreground">{totalCount}</span>
             </div>
          </div>
        </div>
      </div>
      {/* Desktop Table View / Mobile Card View Wrapper */}
      <div className="space-y-4">
        {/* Mobile Card View (Visible on <md) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
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
          ) : customers.length === 0 ? (
            <div className="bg-card border rounded-xl p-8 text-center space-y-3">
               <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
               </div>
               <p className="font-medium text-muted-foreground">{t("no_customers_found")}</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div key={customer.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">#{customer.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{customer.name}</h3>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                      <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                        {t("actions")}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem onClick={() => handleViewDetails(customer)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                          <Eye className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-sm">{t("view")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateDetails(customer)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                        <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                          <Pencil className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-sm">{t("update")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-muted/50" />
                      <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
                        <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-sm">{t("delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1 pt-1">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("organization")}</span>
                   <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {customer.organization || t("n_a")}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("Phone_number")}</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Phone className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate">{customer.phone || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("email")}</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Mail className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate italic">{customer.email || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("address")}</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate">{customer.address || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("tin_number")}</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Fingerprint className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate">{customer.tin_number || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-muted/50 flex items-center justify-start">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("created_by")}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                        {customer.user.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{customer.user}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (Visible on md+) */}
        <div className="hidden md:block bg-card border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    {t("id")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-3.5 w-3.5" />
                    {t("customer_name")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    {t("organization")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {t("Phone_number")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {t("email")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {t("address")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5" />
                    {t("tin_number")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-3.5 w-3.5" />
                    {t("created_by")}
                  </div>
                </TableHead>
                <TableHead className="text-right font-bold text-foreground">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Spinner className="h-8 w-8 text-primary" />
                      <span className="text-muted-foreground animate-pulse">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <div className="p-4 bg-muted/30 rounded-full">
                        <Info className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-medium">{t("no_customers_found")}</p>
                      <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setPage(1) }}>
                        {t("clear_search")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium text-muted-foreground">
                      #{customer.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {customer.organization || t("n_a")}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {customer.phone || "-"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground italic">
                      {customer.email || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {customer.address || "-"}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">
                        {customer.tin_number || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {customer.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{customer.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                            {t("actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-muted/50" />
                          <DropdownMenuItem onClick={() => handleViewDetails(customer)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                              <Eye className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">{t("view")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateDetails(customer)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                            <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                              <Pencil className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-sm">{t("update")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted/50" />
                          <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
                            <div className="p-1.5 bg-destructive/10 text-destructive rounded-md">
                              <Trash2 className="h-3.5 w-3.5" />
                            </div>
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
                // If total pages > 5, show pages around current page
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
      {isError && (
        <p className="mt-4 text-red-500">
          Failed to load customers. Please try again.
        </p>
      )}
      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        customer={selectedCustomer}
      />
      <UpdateCustomerModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        customer={selectedCustomer}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdateSubmit}
        isUpdating={isUpdating}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteCustomer}
        isDeleting={isDeleting}
      />
        </div>
      </div>
    </div>
  );
};

export default ManageCustomer;

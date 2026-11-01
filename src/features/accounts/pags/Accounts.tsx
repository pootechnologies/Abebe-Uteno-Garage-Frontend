// components/Accounts.js
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, deleteUser } from "../api/user";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Trash2, Edit, Users, Plus, Hash, UserCircle, Mail, Shield, Info, ChevronLeft, ChevronRight } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ViewUserModal from "../components/ViewUserModal";
import AddUserDialog from "@/features/accounts/components/AddUserDropdown.tsx";
import UpdateUserDialog from "../components/UpdateUserDialog";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import toast from "react-hot-toast";
import { t } from "i18next";

const Accounts = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isUpdateUserDialogOpen, setIsUpdateUserDialogOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user.");
    },
  });

  const viewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const updateUser = (user) => {
    setSelectedUser(user);
    setIsUpdateUserDialogOpen(true);
  };

  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const closeViewModal = () => setIsViewModalOpen(false);
  const openAddUserDialog = () => setIsAddUserDialogOpen(true);
  const closeAddUserDialog = () => setIsAddUserDialogOpen(false);
  const closeUpdateUserDialog = () => setIsUpdateUserDialogOpen(false);
  const closeDeleteConfirmModal = () => setIsDeleteConfirmModalOpen(false);

  const handleDeleteUser = () => {
    deleteMutation.mutate(selectedUser.id);
    closeDeleteConfirmModal();
  };

  const sortedUsers = [...users].sort((a, b) => b.id - a.id);
  const pageCount = Math.ceil(sortedUsers.length / itemsPerPage);
  const displayUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Users className="h-6 w-6" />
            </div>
            {t("manage_accounts")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={openAddUserDialog}
                  className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_user")}
                </Button>
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
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      {t("email")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      {t("role")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : displayUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_data_found") || "No accounts found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{user.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(user.name || "U").substring(0, 2).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {user.role || t("n_a")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-xl border-muted">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</div>
                            <div className="h-px bg-muted my-1" />
                            <DropdownMenuItem onClick={() => viewUser(user)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-primary/10 transition-colors">
                              <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUser(user)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-blue-500/10 transition-colors">
                              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                                <Edit className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium text-sm">{t("update")}</span>
                            </DropdownMenuItem>
                            <div className="h-px bg-muted my-1" />
                            <DropdownMenuItem onClick={() => confirmDeleteUser(user)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive transition-colors">
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
                  <div className="h-4 w-full bg-muted rounded"></div>
                </div>
              ))
            ) : displayUsers.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_data_found") || "No accounts found"}</p>
              </div>
            ) : (
              displayUsers.map((user) => (
                <div key={user.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{user.id}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {user.role || t("n_a")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{user.name}</h3>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</div>
                        <div className="h-px bg-muted/50 my-1" />
                        <DropdownMenuItem onClick={() => viewUser(user)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateUser(user)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Edit className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <div className="h-px bg-muted/50 my-1" />
                        <DropdownMenuItem onClick={() => confirmDeleteUser(user)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
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
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("email")}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(user.email || "E").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">{user.email}</span>
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
                {t("previous")}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pageCount > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > pageCount) pageNum = pageCount - (4 - i);
                    }
                  }
                  if (pageNum <= pageCount) {
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                disabled={currentPage === pageCount || pageCount === 0}
                className="gap-2 rounded-lg"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ViewUserModal
            user={selectedUser}
            isOpen={isViewModalOpen}
            onClose={closeViewModal}
          />
          <AddUserDialog
            isOpen={isAddUserDialogOpen}
            onClose={closeAddUserDialog}
          />
          {selectedUser && (
            <UpdateUserDialog
              user={selectedUser}
              isOpen={isUpdateUserDialogOpen}
              onClose={closeUpdateUserDialog}
            />
          )}
          <DeleteConfirmModal
            isOpen={isDeleteConfirmModalOpen}
            onClose={closeDeleteConfirmModal}
            onConfirm={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
};

export default Accounts;

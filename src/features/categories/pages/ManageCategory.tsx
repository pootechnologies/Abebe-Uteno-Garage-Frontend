import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Tag,
  Search,
  Hash,
  UserCircle,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  fetchCategories,
  deleteCategory,
  updateCategory,
} from "../api/category";
import { ViewCategoryModal } from "@/features/categories/components/ViewCategoryModal.tsx";
import { ConfirmDeleteModal } from "@/features/categories/components/ConfirmDeleteModal.tsx";
import { UpdateCategoryModal } from "@/features/categories/components/UpdateCategoryModal.tsx";
import Select from "react-select";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  user: string;
}

interface IFormInput {
  name: string;
}

const ManageCategory = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IFormInput>();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    let result = [...categories];

    if (selectedOption) {
      result = result.filter((category) => category.id === selectedOption.value);
    }

    if (nameSearch.trim() !== "") {
      result = result.filter((category) =>
        category.name.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    setFilteredCategories(result);
    setCurrentPage(1);
  }, [selectedOption, nameSearch, categories]);

  useEffect(() => {
    if (selectedCategory) {
      setValue("name", selectedCategory.name);
    }
  }, [selectedCategory, setValue]);

  const handleViewClick = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleUpdateClick = (category: Category) => {
    setSelectedCategory(category);
    setIsUpdateModalOpen(true);
  };

  const onUpdateSubmit = async (data: IFormInput) => {
    if (!data.name.trim()) {
      toast.error(t("category_name_required") || "Category name is required!");
      return;
    }
    try {
      await updateCategory(selectedCategory!.id, data.name);
      await loadCategories();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const displayCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Tag className="h-6 w-6" />
            </div>
            {t("manage_category")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">

      {/* Toolbar / Search Section */}
      <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
            <Select
              options={categoryOptions}
              isClearable
              placeholder={t("search_categories...")}
              className="w-full react-select-container"
              classNamePrefix="react-select"
              onChange={(option: any) => setSelectedOption(option)}
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
              {t("total_categories") || "Total Categories"}: <span className="font-semibold text-foreground">{filteredCategories.length}</span>
            </div>
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
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  {t("category_name")}
                </div>
              </TableHead>
              <TableHead className="font-bold text-foreground">
                <div className="flex items-center gap-2">
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
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j} className="h-16">
                      <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                  {t("no_categories_found") || "No categories found"}
                </TableCell>
              </TableRow>
            ) : (
              displayCategories.map((category) => (
                <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-medium">#{category.id}</TableCell>
                  <TableCell className="font-semibold text-foreground">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                        {(category.user || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{category.user}</span>
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
                        <DropdownMenuItem onClick={() => handleViewClick(category)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Eye className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateClick(category)} className="gap-3 rounded-lg px-2 py-2.5">
                          <Pencil className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">{t("update")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted" />
                        <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive">
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
              <div className="h-4 w-full bg-muted rounded"></div>
            </div>
          ))
        ) : displayCategories.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
              <Info className="h-6 w-6" />
            </div>
            <p className="font-medium text-muted-foreground">{t("no_categories_found") || "No categories found"}</p>
          </div>
        ) : (
          displayCategories.map((category) => (
            <div key={category.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{category.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("category_name")}</span>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{category.name}</h3>
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
                    <DropdownMenuItem onClick={() => handleViewClick(category)} className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                        <Eye className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm">{t("view")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateClick(category)} className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors">
                      <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm">{t("update")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-muted/50" />
                    <DropdownMenuItem onClick={() => handleDeleteClick(category)} className="gap-3 rounded-lg px-2 py-2 focus:bg-destructive/10 text-destructive transition-colors">
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("created_by")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                      {(category.user || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-foreground truncate">{category.user}</span>
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
            {t("next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedCategory && (
        <>
          <ViewCategoryModal
            isOpen={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            category={selectedCategory}
          />

          <UpdateCategoryModal
            isOpen={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            onSubmit={handleSubmit(onUpdateSubmit)}
            register={register}
            errors={errors}
          />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
      />
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;

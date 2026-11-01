import { useQuery } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "./api/product";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Select from "react-select";
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
  Search,
  Tag,
  Hash,
  UserCircle,
  Box,
  BarChart4,
  Banknote,
  Warehouse,
  ShoppingBag,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Download,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import axiosInstanceOld from "@/api/axiosOld";

import ViewProductModal from "./components/ViewProductModal";
import UpdateProductModal from "./components/UpdateProductModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: number;
  name: string;
  part_number: string | null;
  receipt_no: string | null;
  category_name: string | null;
  description: string | null;
  buying_price: number;
  selling_price: number;
  stock: number;
  unit: string;
  piece: number | null;
  package: number | null;
  supplier_name: string | null;
  user: string;
  image: string | null;
}

interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

/*
 * This is the smaller product object returned
 * inside `all_results` when include_all=True.
 */
interface ProductSearchResult {
  id: number;
  name: string;
  part_number: string | null;
  selling_price: number | string;
  stock: number;
}

interface AllProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
  all_results: ProductSearchResult[];
}

const ManageProduct = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);

  /*
   * We no longer use searchTerm as a text search against
   * the current page.
   *
   * Instead, selectedProductId identifies the product
   * selected from all_results.
   */
  const [selectedProductId, setSelectedProductId] = useState<
    number | null
  >(null);

  const [selectedCategory, setSelectedCategory] =
    useState<string>("");

  const [simplifiedView, setSimplifiedView] =
    useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any>(null);

  /*
   * ============================================================
   * MAIN PRODUCTS QUERY
   * ============================================================
   *
   * This request is server-side paginated.
   *
   * Example:
   *
   * /api/garage/products/?page=1
   *
   * /api/garage/products/?page=2
   *
   */
  const {
    data: productResponse,
    isLoading,
    refetch,
  } = useQuery<ProductResponse>({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await axiosInstanceOld.get(
        API_ENDPOINTS.PRODUCTS,
        {
          params: {
            page,
          },
        }
      );

      return response.data;
    },
  });

  /*
   * ============================================================
   * ALL PRODUCTS QUERY FOR SEARCH / SELECT
   * ============================================================
   *
   * This calls:
   *
   * /api/garage/products/?include_all=True
   *
   * and takes:
   *
   * response.data.all_results
   *
   * This means the Product Select contains ALL products,
   * not only the 10 products from the current table page.
   */
  const {
    data: allProductsResponse,
    isLoading: isSearchProductsLoading,
  } = useQuery<AllProductsResponse>({
    queryKey: ["products-search-all"],
    queryFn: async () => {
      const response = await axiosInstanceOld.get(
        API_ENDPOINTS.PRODUCTS,
        {
          params: {
            include_all: "True",
          },
        }
      );

      return response.data;
    },
  });

  /*
   * Products for the current table page.
   */
  const products = productResponse?.results || [];

  /*
   * Total number of products from the backend.
   *
   * Example:
   *
   * count = 18
   */
  const totalProducts = productResponse?.count || 0;

  /*
   * Your backend currently returns 10 products per page.
   */
  const backendItemsPerPage = 10;

  /*
   * Calculate total pages from the backend count.
   */
  const totalPages = Math.ceil(
    totalProducts / backendItemsPerPage
  );

  /*
   * All products used ONLY for the Product Select/Search.
   */
  const allProductsForSearch =
    allProductsResponse?.all_results || [];

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] =
    useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  /*
   * ============================================================
   * FETCH CATEGORIES + COMPANY
   * ============================================================
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, compRes] = await Promise.all([
          axiosInstanceOld.get(
            API_ENDPOINTS.CATEGORIES
          ),
          axiosInstanceOld.get(
            API_ENDPOINTS.COMPANY
          ),
        ]);

        setCategories(catRes.data);
        setCompanyData(compRes.data[0]);
      } catch (error) {
        console.error(
          "Failed to fetch auxiliary data:",
          error
        );
      }
    };

    fetchInitialData();
  }, []);

  /*
   * ============================================================
   * SET UPDATE FORM VALUES
   * ============================================================
   */
  useEffect(() => {
    if (selectedProduct) {
      setValue(
        "name",
        selectedProduct.name
      );

      setValue(
        "part_number",
        selectedProduct.part_number || ""
      );

      setValue(
        "receipt_no",
        selectedProduct.receipt_no || ""
      );

      setValue(
        "description",
        selectedProduct.description || ""
      );

      setValue(
        "buyingPrice",
        selectedProduct.buying_price
      );

      setValue(
        "sellingPrice",
        selectedProduct.selling_price
      );

      setValue(
        "stock",
        selectedProduct.stock
      );

      setValue(
        "unit",
        selectedProduct.unit
      );

      setValue("piece", selectedProduct.piece || "");
      setValue("package", selectedProduct.package || "");
    }
  }, [selectedProduct, setValue]);

  /*
   * ============================================================
   * FILTER CURRENT PAGE
   * ============================================================
   *
   * The backend handles pagination.
   *
   * selectedProductId only filters the products that belong
   * to the currently loaded page.
   *
   * When the user selects a product from all_results, we
   * automatically move to the page where that product exists.
   */
  const filteredProducts = products
    .filter((p) => {
      const matchesProduct = selectedProductId
        ? p.id === selectedProductId
        : true;

      const matchesCategory = selectedCategory
        ? p.category_name === selectedCategory
        : true;

      return (
        matchesProduct &&
        matchesCategory
      );
    })
    .sort((a, b) => b.id - a.id);

  /*
   * ============================================================
   * TOTAL INVENTORY VALUE
   * ============================================================
   *
   * This is calculated for the products currently loaded
   * on the current server-side page.
   */
  const totalInventoryValue =
    filteredProducts.reduce(
      (acc, p) =>
        acc +
        Number(p.buying_price) *
        Number(p.stock),
      0
    );

  /*
   * No .slice() here.
   *
   * The backend already paginated the results.
   */
  const displayProducts = filteredProducts;

  /*
   * ============================================================
   * PRODUCT SELECT OPTIONS
   * ============================================================
   *
   * IMPORTANT:
   *
   * Use allProductsForSearch, NOT products.
   *
   * Therefore the Select contains all products returned
   * by:
   *
   * include_all=True
   */
  const productOptions = allProductsForSearch.map(
    (p) => ({
      value: p.id,
      label: p.part_number
        ? `${p.name} - ${p.part_number}`
        : p.name,
    })
  );

  /*
   * ============================================================
   * PRODUCT SEARCH / SELECT
   * ============================================================
   *
   * When the user selects a product:
   *
   * 1. Save its ID.
   * 2. Find its position in all_results.
   * 3. Sort all_results by ID descending so that it matches
   *    the table's current backend ordering.
   * 4. Calculate which page the product belongs to.
   * 5. Move the table to that page.
   */
  const handleProductSearch = (
    option: any
  ) => {
    if (!option) {
      setSelectedProductId(null);
      setPage(1);
      return;
    }

    const productId = Number(option.value);

    setSelectedProductId(productId);

    /*
     * The table is ordered by newest/highest ID first.
     *
     * all_results may be returned in ascending order,
     * so we sort it descending before finding the index.
     */
    const sortedAllProducts = [
      ...allProductsForSearch,
    ].sort((a, b) => b.id - a.id);

    const productIndex =
      sortedAllProducts.findIndex(
        (p) => p.id === productId
      );

    if (productIndex !== -1) {
      const targetPage =
        Math.floor(
          productIndex / backendItemsPerPage
        ) + 1;

      setPage(targetPage);
    } else {
      setPage(1);
    }
  };

  /*
   * ============================================================
   * VIEW PRODUCT
   * ============================================================
   */
  const handleViewDetails = (
    product: Product
  ) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  /*
   * ============================================================
   * UPDATE PRODUCT
   * ============================================================
   */
  const handleUpdateDetails = (
    product: Product
  ) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  /*
   * ============================================================
   * DELETE PRODUCT
   * ============================================================
   */
  const handleDeleteProduct = (
    product: Product
  ) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  /*
   * ============================================================
   * CONFIRM DELETE
   * ============================================================
   */
  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);

    try {
      await deleteProduct(
        selectedProduct.id
      );

      /*
       * Refetch current server-side page.
       */
      await refetch();

      /*
       * If deleting the last item on the current
       * page causes the page to become empty,
       * move back one page.
       */
      if (
        page > 1 &&
        products.length === 1
      ) {
        setPage((prev) =>
          Math.max(prev - 1, 1)
        );
      }

      /*
       * Clear selected search product after delete.
       */
      setSelectedProductId(null);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  /*
   * ============================================================
   * UPDATE SUBMIT
   * ============================================================
   */
  const handleUpdateSubmit = async (
    data: any
  ) => {
    if (!selectedProduct) return;

    setIsUpdating(true);

    try {
      const formData = new FormData();

      if (
        data.name !==
        selectedProduct.name
      ) {
        formData.append(
          "name",
          data.name
        );
      }

      if (
        data.part_number !==
        selectedProduct.part_number
      ) {
        formData.append(
          "part_number",
          data.part_number
        );
      }

      if (
        data.receipt_no !==
        selectedProduct.receipt_no
      ) {
        formData.append(
          "receipt_no",
          data.receipt_no
        );
      }

      if (
        data.description !==
        selectedProduct.description
      ) {
        formData.append(
          "description",
          data.description
        );
      }

      if (
        parseFloat(data.buyingPrice) !==
        selectedProduct.buying_price
      ) {
        formData.append(
          "buying_price",
          data.buyingPrice
        );
      }

      if (
        parseFloat(data.sellingPrice) !==
        selectedProduct.selling_price
      ) {
        formData.append(
          "selling_price",
          data.sellingPrice
        );
      }

      if (
        parseInt(data.stock) !==
        selectedProduct.stock
      ) {
        formData.append(
          "stock",
          data.stock
        );
      }

      if (
        data.unit !==
        selectedProduct.unit
      ) {
        formData.append(
          "unit",
          data.unit
        );
      }

      if (
        data.piece &&
        parseInt(data.piece) !== selectedProduct.piece
      ) {
        formData.append("piece", data.piece);
      }

      if (
        data.package &&
        parseInt(data.package) !== selectedProduct.package
      ) {
        formData.append("package", data.package);
      }

      await axiosInstanceOld.patch(
        `${API_ENDPOINTS.PRODUCTS}${selectedProduct.id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        t(
          "product_updated_successfully"
        ) ||
        "Product updated successfully!"
      );

      setIsUpdateModalOpen(false);

      /*
       * Refetch current page.
       */
      await refetch();
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      toast.error(
        t(
          "failed_to_update_product"
        ) ||
        "Failed to update product"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * ============================================================
   * EXPORT TO EXCEL
   * ============================================================
   */
  const exportToExcel = async () => {
    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        "Products"
      );

    const startRow = 5;

    if (companyData?.logo) {
      try {
        const imageUrl = `${IMAGE_BASE_URL}${companyData.logo}`;

        const response =
          await fetch(imageUrl);

        const imageBuffer =
          await response.arrayBuffer();

        const imageId =
          workbook.addImage({
            buffer: imageBuffer,
            extension: "png",
          });

        worksheet.addImage(
          imageId,
          {
            tl: {
              col: 0,
              row: 0,
            },
            ext: {
              width: 180,
              height: 80,
            },
          }
        );
      } catch (e) {
        console.error(
          "Failed to add logo to Excel:",
          e
        );
      }
    }

    const amNameRow =
      worksheet.getRow(1);

    amNameRow.getCell(1).value =
      companyData?.am_name;

    amNameRow.height = 35;

    amNameRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFFF0000",
      },
    };

    amNameRow.getCell(1).font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
      size: 18,
    };

    amNameRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.mergeCells(
      `A1:E1`
    );

    const enNameRow =
      worksheet.getRow(2);

    enNameRow.getCell(1).value =
      companyData?.en_name;

    enNameRow.height = 25;

    enNameRow.getCell(1).font = {
      bold: true,
      size: 14,
    };

    enNameRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFFF0000",
      },
    };

    enNameRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.mergeCells(
      `A2:E2`
    );

    worksheet.getRow(4).values = [
      t("product_name"),
      t("buying_price"),
      t("stock"),
      t("unit"),
      t("total_price"),
    ];

    worksheet.getRow(4).font = {
      bold: true,
    };

    filteredProducts.forEach(
      (product, index) => {
        worksheet.getRow(
          startRow + index
        ).values = [
            product.name,
            product.buying_price,
            product.stock,
            product.unit,
            Number(
              product.buying_price
            ) *
            Number(product.stock),
          ];
      }
    );

    const grandTotalRow =
      worksheet.getRow(
        startRow +
        filteredProducts.length +
        1
      );

    grandTotalRow.getCell(
      4
    ).value = t("grand_total");

    grandTotalRow.getCell(
      5
    ).value = totalInventoryValue;

    grandTotalRow.font = {
      bold: true,
    };

    const buffer =
      await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      `Product_Report_${new Date()
        .toISOString()
        .split("T")[0]
      }.xlsx`
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <ShoppingBag className="h-6 w-6" />
              </div>

              {t("manage_products")}
            </h2>

            {/*
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="rounded-xl border-emerald-500/30 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-500 gap-2 h-10 transition-all"
            >
              <Download className="h-4 w-4" />
              {t("export_report")}
            </Button>
            */}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-2xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col xl:flex-row items-center gap-6">

              {/* Product Search */}
              <div className="relative w-full xl:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />

                <Select
                  options={productOptions}
                  placeholder={t(
                    "search_by_product"
                  )}
                  isClearable
                  isSearchable
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  isLoading={
                    isSearchProductsLoading
                  }
                  onChange={
                    handleProductSearch
                  }
                  noOptionsMessage={() =>
                    t(
                      "no_products_found"
                    ) ||
                    "No products found"
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2rem",
                      borderRadius:
                        "0.75rem",
                      borderColor:
                        "var(--border)",
                      backgroundColor:
                        "transparent",
                      "&:hover": {
                        borderColor:
                          "var(--primary)",
                      },
                    }),

                    menu: (base) => ({
                      ...base,
                      borderRadius:
                        "0.75rem",
                      overflow: "hidden",
                    }),
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">

                {/* Category Filter */}
                <select
                  className="h-10 px-4 bg-muted/20 border border-muted-foreground/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium"
                  value={
                    selectedCategory
                  }
                  onChange={(e) => {
                    setSelectedCategory(
                      e.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    {t(
                      "all_category"
                    )}
                  </option>

                  {categories.map(
                    (c) => (
                      <option
                        key={c.id}
                        value={c.name}
                      >
                        {c.name}
                      </option>
                    )
                  )}
                </select>

                {/* Simplified View */}
                <Button
                  variant={
                    simplifiedView
                      ? "secondary"
                      : "outline"
                  }
                  size="sm"
                  className="h-10 rounded-xl px-5 transition-all gap-2"
                  onClick={() =>
                    setSimplifiedView(
                      !simplifiedView
                    )
                  }
                >
                  <FileText className="h-4 w-4" />

                  {simplifiedView
                    ? t("detailed")
                    : t("simplified")}
                </Button>
              </div>

              {/* Inventory Value */}
              <div className="flex items-center gap-6 ml-auto border-l border-muted pl-6">

                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    {t(
                      "total_inventory_value"
                    ) ||
                      "Total Inventory Value"}
                  </span>

                  <span className="text-xl font-black text-primary tabular-nums">
                    {formatCurrency(
                      totalInventoryValue
                    )}

                    <span className="text-xs font-normal">
                      {" "}
                      ETB
                    </span>
                  </span>
                </div>

                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Banknote className="h-5 w-5" />
                </div>
              </div>

            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-card border rounded-2xl shadow-sm overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-md">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">

                  <TableHead className="w-[80px] font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("id")}
                    </div>
                  </TableHead>

                  <TableHead className="font-bold text-foreground min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {t("product_name")}
                    </div>
                  </TableHead>

                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      {t("part_number")}
                    </div>
                  </TableHead>

                  {!simplifiedView && (
                    <>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Box className="h-3.5 w-3.5 text-primary" />
                          {t("category")}
                        </div>
                      </TableHead>

                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Info className="h-3.5 w-3.5 text-primary" />
                          {t("description")}
                        </div>
                      </TableHead>

                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-3.5 w-3.5 text-primary" />
                          {t("supplier")}
                        </div>
                      </TableHead>
                    </>
                  )}

                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3.5 w-3.5 text-primary" />
                      {t("buying_price")}
                    </div>
                  </TableHead>

                  {!simplifiedView && (
                    <>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                          {t("selling_price")}
                        </div>
                      </TableHead>

                      {/*
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 text-primary" />
                          {t("piece")}
                        </div>
                      </TableHead>
                      */}

                      {/*
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Box className="h-3.5 w-3.5 text-primary" />
                          {t("package")}
                        </div>
                      </TableHead>
                      */}
                    </>
                  )}

                  <TableHead className="font-bold text-foreground text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <BarChart4 className="h-3.5 w-3.5 text-primary" />
                      {t("stock")}
                    </div>
                  </TableHead>

                  <TableHead className="font-bold text-foreground text-nowrap">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-3.5 w-3.5 text-primary" />
                      {t("unit")}
                    </div>
                  </TableHead>

                  {!simplifiedView && (
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2 text-nowrap">
                        <UserCircle className="h-3.5 w-3.5 text-primary" />
                        {t("created_by")}
                      </div>
                    </TableHead>
                  )}

                  {simplifiedView && (
                    <TableHead className="font-bold text-foreground text-right">
                      <div className="flex items-center gap-2 justify-end text-primary/70">
                        {t("total_price")}
                      </div>
                    </TableHead>
                  )}

                  <TableHead className="text-right font-bold text-foreground">
                    {t("actions")}
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {isLoading ? (
                  Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse"
                    >
                      {Array.from({
                        length:
                          simplifiedView
                            ? 8
                            : 12,
                      }).map(
                        (_, j) => (
                          <TableCell
                            key={j}
                            className="h-16"
                          >
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                ) : filteredProducts.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="p-4 bg-muted/30 rounded-full">
                          <Info className="h-10 w-10" />
                        </div>

                        <p className="text-lg font-bold">
                          {t(
                            "no_products_found"
                          ) ||
                            "No products found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayProducts.map(
                    (p) => (
                      <TableRow
                        key={p.id}
                        className="group hover:bg-muted/30 transition-all duration-200"
                      >

                        <TableCell className="text-muted-foreground font-normal text-[11px]">
                          #{p.id}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-normal text-foreground group-hover:text-primary transition-colors leading-tight">
                              {p.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-normal text-muted-foreground">
                          {p.part_number ||
                            "-"}
                        </TableCell>

                        {!simplifiedView && (
                          <>
                            <TableCell>
                              <span className="text-[10px] font-normal uppercase tracking-wider whitespace-nowrap text-primary/70">
                                {p.category_name ||
                                  "N/A"}
                              </span>
                            </TableCell>

                            <TableCell className="max-w-[150px] truncate">
                              {p.description ||
                                "-"}
                            </TableCell>

                            <TableCell className="text-xs font-normal whitespace-nowrap">
                              {p.supplier_name ||
                                "-"}
                            </TableCell>
                          </>
                        )}

                        <TableCell className="font-normal text-foreground tabular-nums">
                          {formatCurrency(
                            p.buying_price
                          )}
                        </TableCell>

                        {!simplifiedView && (
                          <>
                            <TableCell className="font-normal text-primary/80 tabular-nums">
                              {formatCurrency(
                                p.selling_price
                              )}
                            </TableCell>
                          </>
                        )}

                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center justify-center font-normal text-xs tabular-nums transition-all ${p.stock <=
                              3
                              ? "text-destructive animate-pulse"
                              : "text-foreground"
                              }`}
                          >
                            {p.stock}
                          </span>
                        </TableCell>

                        <TableCell className="font-normal text-muted-foreground text-xs uppercase tracking-widest">
                          {p.unit}
                        </TableCell>

                        {!simplifiedView && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                {(
                                  p.user ||
                                  "U"
                                )
                                  .substring(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}
                              </div>

                              <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                                {p.user}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {simplifiedView && (
                          <TableCell className="text-right font-normal text-primary tabular-nums">
                            {formatCurrency(
                              Number(
                                p.buying_price
                              ) *
                              Number(
                                p.stock
                              )
                            )}
                          </TableCell>
                        )}

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                            >
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted"
                            >
                              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                                {t(
                                  "actions"
                                )}
                              </DropdownMenuLabel>

                              <DropdownMenuSeparator className="bg-muted" />

                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewDetails(
                                    p
                                  )
                                }
                                className="gap-3 rounded-lg px-2 py-2.5 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-primary" />

                                <span className="font-bold text-sm">
                                  {t(
                                    "view"
                                  )}
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateDetails(
                                    p
                                  )
                                }
                                className="gap-3 rounded-lg px-2 py-2.5 transition-colors font-medium"
                              >
                                <Pencil className="h-4 w-4 text-orange-500" />

                                <span className="font-bold text-sm">
                                  {t(
                                    "update"
                                  )}
                                </span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-muted" />

                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteProduct(
                                    p
                                  )
                                }
                                className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />

                                <span className="font-black text-sm">
                                  {t(
                                    "delete"
                                  )}
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>

                      </TableRow>
                    )
                  )
                )}

              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">

            {isLoading ? (
              Array.from({
                length: 3,
              }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card border rounded-2xl p-5 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                  </div>

                  <div className="h-6 w-3/4 bg-muted rounded"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-muted rounded-xl"></div>
                    <div className="h-10 bg-muted rounded-xl"></div>
                  </div>
                </div>
              ))
            ) : filteredProducts.length ===
              0 ? (
              <div className="bg-card border rounded-2xl p-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                  <Info className="h-8 w-8 text-muted-foreground" />
                </div>

                <p className="font-black text-muted-foreground text-lg">
                  {t(
                    "no_products_found"
                  )}
                </p>
              </div>
            ) : (
              displayProducts.map(
                (p) => (
                  <div
                    key={p.id}
                    className="bg-card border rounded-2xl p-5 shadow-sm space-y-5 relative group hover:border-primary/50 transition-all active:scale-[0.98]"
                  >

                    <div className="flex justify-between items-start">

                      <div className="flex gap-4">

                        <div className="space-y-1 mt-1 overflow-hidden">

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md leading-none shrink-0">
                              #{p.id}
                            </span>
                          </div>

                          <h3 className="font-normal text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
                            {p.name}

                            {p.part_number && (
                              <span className="text-muted-foreground font-normal text-sm">
                                {" "}
                                -{" "}
                                {
                                  p.part_number
                                }
                              </span>
                            )}
                          </h3>

                          {!simplifiedView && (
                            <div className="flex items-center gap-2 mt-1">
                              <Box className="h-3 w-3 text-primary" />

                              <span className="text-[10px] font-normal uppercase text-primary/70">
                                {p.category_name ||
                                  "N/A"}
                              </span>
                            </div>
                          )}

                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                        >
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-[200px] rounded-2xl p-2 shadow-2xl border-muted/50"
                        >

                          <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-2">
                            {t(
                              "actions"
                            )}
                          </DropdownMenuLabel>

                          <DropdownMenuSeparator className="bg-muted/50" />

                          <DropdownMenuItem
                            onClick={() =>
                              handleViewDetails(
                                p
                              )
                            }
                            className="gap-3 rounded-xl px-3 py-3 focus:bg-primary/10 transition-all"
                          >
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                              <Eye className="h-4 w-4" />
                            </div>

                            <span className="font-black text-sm">
                              {t("view")}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateDetails(
                                p
                              )
                            }
                            className="gap-3 rounded-xl px-3 py-3 focus:bg-blue-500/10 transition-all"
                          >
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                              <Pencil className="h-4 w-4" />
                            </div>

                            <span className="font-black text-sm">
                              {t(
                                "update"
                              )}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-muted/50" />

                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteProduct(
                                p
                              )
                            }
                            className="gap-3 rounded-xl px-3 py-3 focus:bg-destructive/10 text-destructive transition-all"
                          >
                            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </div>

                            <span className="font-black text-sm">
                              {t(
                                "delete"
                              )}
                            </span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="p-3 bg-muted/20 rounded-xl border border-muted-foreground/5 space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                          {t(
                            "buying_price"
                          )}
                        </span>

                        <div className="text-sm font-normal text-foreground tabular-nums">
                          {formatCurrency(
                            p.buying_price
                          )}

                          <span className="text-[10px] font-normal">
                            {" "}
                            ETB
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/20 rounded-xl border border-muted-foreground/5 space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                          {t(
                            "selling_price"
                          )}
                        </span>

                        <div className="text-sm font-normal text-primary tabular-nums">
                          {formatCurrency(
                            p.selling_price
                          )}

                          <span className="text-[10px] font-normal">
                            {" "}
                            ETB
                          </span>
                        </div>
                      </div>

                      {!simplifiedView && (
                        <>
                          {/*
                          <div className="p-3 bg-muted/20 rounded-xl border border-muted-foreground/5 space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                              {t("piece")}
                            </span>
                            <div className="text-sm font-normal text-foreground tabular-nums">
                              {p.piece || "-"}
                            </div>
                          </div>
                          */}

                          {/*
                          <div className="p-3 bg-muted/20 rounded-xl border border-muted-foreground/5 space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                              {t("package")}
                            </span>
                            <div className="text-sm font-normal text-foreground tabular-nums">
                              {p.package || "-"}
                            </div>
                          </div>
                          */}
                        </>
                      )}

                      <div className="col-span-2 space-y-3 pt-2">

                        <div className="flex items-center justify-between border-b border-muted pb-2">

                          <div className="flex items-center gap-3 text-muted-foreground">
                            <BarChart4 className="h-4 w-4 text-primary" />

                            <span className="text-xs font-black uppercase tracking-widest">
                              {t(
                                "stock"
                              )}
                            </span>
                          </div>

                          <div
                            className={`text-lg font-normal tabular-nums ${p.stock <=
                              3
                              ? "text-destructive animate-pulse"
                              : "text-foreground"
                              }`}
                          >
                            {p.stock}

                            <span className="text-xs font-normal opacity-70">
                              {" "}
                              {p.unit}
                            </span>
                          </div>

                        </div>

                        {!simplifiedView && (
                          <>
                            <div className="flex flex-col gap-1">

                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                {t(
                                  "supplier"
                                )}
                              </span>

                              <span className="text-sm font-normal text-foreground">
                                {p.supplier_name ||
                                  "-"}
                              </span>

                            </div>

                            {p.description && (
                              <div className="flex flex-col gap-1">

                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                  {t(
                                    "description"
                                  )}
                                </span>

                                <p className="text-xs text-muted-foreground italic leading-relaxed">
                                  {
                                    p.description
                                  }
                                </p>

                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>

                    <div className="pt-4 border-t border-muted/50 flex items-center justify-start">

                      <div className="flex items-center gap-3 text-muted-foreground transition-all">

                        <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                          {t(
                            "recorded_by"
                          )}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all">

                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                            {(
                              p.user ||
                              "U"
                            )
                              .substring(
                                0,
                                2
                              )
                              .toUpperCase()}
                          </div>

                          <span className="text-[10px] font-normal text-muted-foreground leading-none">
                            {p.user}
                          </span>

                        </div>
                      </div>
                    </div>

                  </div>
                )
              )
            )}

          </div>

          {/* Pagination Section */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-muted">

            {/* Previous */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) =>
                  Math.max(
                    prev - 1,
                    1
                  )
                )
              }
              disabled={
                !productResponse?.previous ||
                isLoading
              }
              className="gap-2 rounded-xl h-10 px-4 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Button>

            {/* Page Info */}
            <span className="text-sm font-bold text-muted-foreground">
              {t("page") || "page"} {page}/{totalPages}
            </span>

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              disabled={
                !productResponse?.next ||
                isLoading
              }
              className="gap-2 rounded-xl h-10 px-4 transition-all"
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>

          </div>

          {/* View Product Modal */}
          <ViewProductModal
            isOpen={
              isViewModalOpen
            }
            onOpenChange={
              setIsViewModalOpen
            }
            product={
              selectedProduct
            }
          />

          {/* Update Product Modal */}
          <UpdateProductModal
            isOpen={
              isUpdateModalOpen
            }
            onOpenChange={
              setIsUpdateModalOpen
            }
            onSubmit={
              handleUpdateSubmit
            }
            register={register}
            handleSubmit={
              handleSubmit
            }
            isUpdating={
              isUpdating
            }
            selectedProduct={
              selectedProduct
            }
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            isOpen={
              isDeleteModalOpen
            }
            onOpenChange={
              setIsDeleteModalOpen
            }
            onConfirm={
              confirmDeleteProduct
            }
            isDeleting={
              isDeleting
            }
          />

        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
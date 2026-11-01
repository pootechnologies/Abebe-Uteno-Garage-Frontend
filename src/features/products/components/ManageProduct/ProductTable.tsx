import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import axiosInstanceOld from "@/api/axiosOld";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Eye, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Select from "react-select";

const ProductTable = ({
  products,
  productOptions,
  categories,
  onViewClick,
  onUpdateClick,
  onDeleteClick,
  onImageClick,
  onSearch,
  searchTerm,
  noProductsFound,
  isLoadingProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [simplifiedView, setSimplifiedView] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const itemsPerPage = 8;

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const sortedProducts = [...products].sort((a, b) => b.id - a.id);

  const filteredProducts = sortedProducts.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.category_name === selectedCategory
      : true;
    const matchesSearchTerm = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearchTerm;
  });

  const totalAmount = filteredProducts.reduce(
    (acc, product) => acc + product.buying_price * product.stock,
    0
  );

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstanceOld.get(API_ENDPOINTS.COMPANY);
        setCompanyData(response.data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");
    const startRow = 5;

    if (companyData?.logo) {
      const imageUrl = `${IMAGE_BASE_URL}${companyData.logo}`;
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 100 },
      });
    }

    const redRow = worksheet.getRow(startRow - 4);
    redRow.getCell(1).value = companyData?.am_name;
    redRow.height = 40;
    redRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    redRow.getCell(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 20,
    };
    redRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells(`A${startRow - 4}:E${startRow - 4}`);

    const englishNameRow = worksheet.getRow(startRow - 3);
    englishNameRow.getCell(1).value = companyData?.en_name;
    englishNameRow.height = 30;
    englishNameRow.getCell(1).font = {
      bold: true,
      size: 16,
    };
    englishNameRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF0000" },
    };
    englishNameRow.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.mergeCells(`A${startRow - 3}:E${startRow - 3}`);

    const emptyRow = worksheet.getRow(startRow - 2);
    emptyRow.height = 20;

    worksheet.getRow(startRow - 1).values = [
      t("product_name"),
      t("buying_price"),
      t("stock"),
      t("unit"),
      t("total_price"),
    ];
    worksheet.getRow(startRow - 1).font = { bold: true };

    filteredProducts.forEach((product, index) => {
      const totalPrice = product.buying_price * product.stock;
      worksheet.getRow(startRow + index).values = [
        product.name,
        formatCurrency(product.buying_price),
        product.stock,
        product.unit,
        formatCurrency(totalPrice),
      ];
    });

    const grandTotalRowIndex = startRow + filteredProducts.length + 1;
    worksheet.getRow(grandTotalRowIndex).values = [];
    worksheet.getRow(grandTotalRowIndex + 1).values = [
      "",
      "",
      "",
      t("grand_total"),
      formatCurrency(totalAmount),
    ];
    worksheet.getRow(grandTotalRowIndex + 1).font = { bold: true };

    for (let i = 1; i <= 5; i++) {
      let maxLength = 10;
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const cell = row.getCell(i);
        const cellValue = cell.value ? cell.value.toString() : "";
        const cellLines = cellValue.split("\n");
        const maxLineLength = Math.max(...cellLines.map((line) => line.length));
        if (maxLineLength > maxLength) {
          maxLength = maxLineLength;
        }
      });
      worksheet.getColumn(i).width = maxLength + 2;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const date = new Date();
    const fileName = `report_${date.toISOString().split("T")[0]}_${date
      .toTimeString()
      .split(" ")[0]
      .replace(/:/g, "-")}.xlsx`;
    saveAs(blob, fileName);
  };

  const toggleSimplifiedView = () => {
    setSimplifiedView(!simplifiedView);
  };

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
        {t("manage_products")}
      </h3>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full mb-4 space-y-4 xl:space-y-0">
        <div className="flex flex-col w-full gap-4 xl:flex-row xl:items-center xl:gap-x-10">
          <Select
            options={productOptions}
            placeholder={t("search_by_product")}
            onChange={onSearch}
            isClearable
            className="w-full xl:w-64"
          />
          <select
            className="p-2 border border-gray-300 rounded text-sm w-full xl:w-auto"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">{t("all_category")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            className="p-2 border border-gray-300 rounded text-sm w-full xl:w-auto"
            onClick={toggleSimplifiedView}
          >
            {simplifiedView ? t("detailed") : t("simplified")}
          </button>
          <div className="flex sm:flex-row sm:items-center gap-1 p-2 rounded">
            <h1 className="font-bold text-sm">{t("total_amount")}:</h1>
            <span className="font-bold text-sm">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
        <div className="w-auto xl:w-auto">
          <Button
            className="w-auto xl:w-auto p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
            onClick={exportToExcel}
          >
            {t("export_report")}
          </Button>
        </div>
      </div>
      {noProductsFound ? (
        <p className="text-center text-red-500 text-sm mt-20 border p-10 rounded-lg">
          No products found
        </p>
      ) : (
        <>
          {/* Desktop View - Table */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {simplifiedView ? (
                    <>
                      <TableHead>{t("id")}</TableHead>
                      <TableHead>{t("product_name")}</TableHead>
                      <TableHead>{t("part_number")}</TableHead>
                      <TableHead>{t("buying_price")}</TableHead>
                      <TableHead>{t("stock")}</TableHead>
                      <TableHead>{t("unit")}</TableHead>
                      <TableHead>{t("total_price")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>{t("id")}</TableHead>
                      <TableHead>{t("product_name")}</TableHead>
                      <TableHead>{t("part_number")}</TableHead>
                      <TableHead>{t("category_name")}</TableHead>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("supplier")}</TableHead>
                      <TableHead>{t("buying_price")}</TableHead>
                      <TableHead>{t("selling_price")}</TableHead>
                      <TableHead>{t("stock")}</TableHead>
                      <TableHead>{t("unit")}</TableHead>
                      {/* <TableHead>{t("piece")}</TableHead> */}
                      {/* <TableHead>{t("package")}</TableHead> */}
                      <TableHead>{t("created_by")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts ? (
                  <TableRow>
                    <TableCell colSpan={simplifiedView ? 8 : 12} className="h-24 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : displayProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={simplifiedView ? 8 : 12} className="h-24 text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayProducts.map((product) => {
                    const totalPrice = product.buying_price * product.stock;
                    return (
                      <TableRow key={product.id}>
                        {simplifiedView ? (
                          <>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.part_number}</TableCell>
                            <TableCell>{product.buying_price}</TableCell>
                            <TableCell className={product.stock <= 3 ? "text-red-500" : ""}>
                              {product.stock}
                            </TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{formatCurrency(totalPrice)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onViewClick(product)} className="text-blue-600">
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                    {t("view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onUpdateClick(product)} className="text-yellow-600">
                                    <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                                    {t("update")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onDeleteClick(product)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    {t("delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.part_number}</TableCell>
                            <TableCell>{product.category_name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>{product.supplier_name}</TableCell>
                            <TableCell>{product.buying_price}</TableCell>
                            <TableCell>{product.selling_price}</TableCell>
                            <TableCell className={product.stock <= 3 ? "text-red-500" : ""}>
                              {product.stock}
                            </TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{product.user}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onViewClick(product)} className="text-blue-600">
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                    {t("view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onUpdateClick(product)} className="text-yellow-600">
                                    <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                                    {t("update")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onDeleteClick(product)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    {t("delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some((v) => v) && !expandedCards[product.id]
                  ? "opacity-40 blur-sm"
                  : ""
                  }`}
              >
                <div className="flex justify-between items-start mb-3 pb-3 border-b">
                  <div>
                    <h3 className="text-sm text-gray-600">#{product.id}</h3>
                    <p className="text-base font-bold">{product.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewClick(product)}>
                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                        {t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateClick(product)}>
                        <Pencil className="mr-2 h-4 w-4 text-yellow-600" />
                        {t("update")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteClick(product)}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("buying_price")}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(product.buying_price)} ETB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("selling_price")}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(product.selling_price)} ETB
                    </span>
                  </div>
                  <div className="flex justify-between  bg-gray-50 rounded ">
                    <span className="text-gray-700 font-medium">{t("stock")}</span>
                    <span
                      className={`font-bold ${product.stock <= 3 ? "text-red-500" : "text-gray-900"
                        }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedCards((prev) => {
                      const isCurrentlyExpanded = prev[product.id];
                      return isCurrentlyExpanded ? {} : { [product.id]: true };
                    })
                  }
                  className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {expandedCards[product.id] ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Details</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>

                {expandedCards[product.id] && (
                  <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("category_name")}</span>
                      <span className="font-medium text-gray-900">
                        {product.category_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("description")}</span>
                      <span className="font-medium text-gray-900">
                        {product.description || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("supplier")}</span>
                      <span className="font-medium text-gray-900">
                        {product.supplier_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("unit")}</span>
                      <span className="font-medium text-gray-900">{product.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("piece")}</span>
                      <span className="font-medium text-gray-900">
                        {product.piece || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("package")}</span>
                      <span className="font-medium text-gray-900">
                        {product.package || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("created_by")}</span>
                      <span className="font-medium text-gray-900">{product.user}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t("previous") || "Previous"}
        </Button>
        <span className="text-sm font-medium text-gray-600">
          {t("page") || "page"} {currentPage}/{pageCount}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          {t("next") || "Next"}
        </Button>
      </div>
    </>
  );
};

export default ProductTable;

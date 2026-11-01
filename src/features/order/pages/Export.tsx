import { Button } from "@/components/ui/button";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import axios from "axios";
import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { useTranslation } from "react-i18next";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Select from "react-select";
import {
  FileDown,
  Search,
  Hash,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Phone,
  Calendar,
  DollarSign,
  Layers,
  ClipboardList,
  ArrowUp
} from "lucide-react";

interface ReportItem {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_tin_number: string;
  order_date: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_amount: number;
  price: number;
  user: string;
}

const ExportPage = () => {
  const { t } = useTranslation();
  const url = `${API_BASE_URL}${API_ENDPOINTS.REPORT}`;

  const [data, setData] = useState<ReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<ReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string; type: string } | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // ✅ SORT ONLY BY ID (DESCENDING)
        const sortedData = response.data.sort((a: ReportItem, b: ReportItem) => b.id - a.id);

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  useEffect(() => {
    let result = [...data];

    if (selectedOption) {
      result = result.filter((item) => 
        item.customer_name === selectedOption.value || 
        item.product_name === selectedOption.value
      );
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [selectedOption, data]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");
    const date = new Date().toLocaleTimeString().replace(/:/g, "-");

    const headers = [
      "Id",
      "Customer Name",
      "Customer Phone",
      "Customer TIN Number",
      "Order Date",
      "Product Name",
      "Product Price",
      "Quantity",
      "Price",
    ];

    worksheet.addRow(headers);

    filteredData.forEach((item) => {
      worksheet.addRow([
        item.id,
        item.customer_name,
        item.customer_phone,
        item.customer_tin_number,
        formatDateTypeStamp(item.order_date),
        item.product_name,
        item.product_price,
        item.quantity,
        item.price,
      ]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `report_${date}.xlsx`;
      link.click();
    });
  };

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
        <Info className="h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    </div>
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const searchOptions = Array.from(new Set([
    ...data.map(item => JSON.stringify({ value: item.customer_name, label: item.customer_name, type: "Customer" })),
    ...data.map(item => JSON.stringify({ value: item.product_name, label: item.product_name, type: "Product" }))
  ])).map(str => JSON.parse(str)) as { value: string; label: string; type: string }[];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
              {t("report_page")}
            </h2>
            <Button 
              onClick={handleExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md transition-all active:scale-95"
            >
              <FileDown className="h-4 w-4" />
              {t("export_report")}
            </Button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  options={searchOptions}
                  isClearable
                  placeholder={t("search_by_customer_or_product") || "Search by customer or product..."}
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  onChange={(option) => setSelectedOption(option)}
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
                      zIndex: 50
                    })
                  }}
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total_reports") || "Total Reports"}: <span className="font-semibold text-black dark:text-white">{filteredData.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-foreground" />
                      {t("id")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-foreground" />
                      {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-foreground" />
                      {t("customer_phone")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-foreground" />
                      {t("order_date")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-foreground" />
                      {t("product_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-foreground" />
                      {t("total_amount")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right">
                    <div className="flex items-center justify-end gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-foreground" />
                      {t("created_by")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : displayData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_data_found") || "No data found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{item.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{item.customer_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.customer_phone}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTypeStamp(item.order_date)}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.product_name}</TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-white">{item.total_amount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(item.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          {item.user}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="h-6 w-32 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-2/3 bg-muted rounded"></div>
                </div>
              ))
            ) : displayData.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_data_found") || "No data found"}</p>
              </div>
            ) : (
              displayData.map((item) => (
                <div key={item.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{item.id}</span>
                        <span className="text-xs font-medium text-muted-foreground">{formatDateTypeStamp(item.order_date)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 transition-colors leading-tight">{item.customer_name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("amount")}</span>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{item.total_amount}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-muted/50">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("product")}</span>
                      <span className="text-sm font-semibold text-foreground truncate block">{item.product_name}</span>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("created_by")}</span>
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                          {(item.user || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">{item.user}</span>
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
                className="gap-2 rounded-lg text-black dark:text-white"
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
                        className={`h-8 w-8 rounded-lg ${currentPage === pageNum ? "default" : "ghost"}`}
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
                className="gap-2 rounded-lg text-black dark:text-white"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 left-6 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 z-50 group hover:scale-110 active:scale-95"
        >
          <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

    </div>
  );
};

export default ExportPage;


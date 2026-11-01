import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { t } from "i18next";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.js";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  UserCircle,
  RefreshCw,
  Calendar,
  History,
  Info,
  Wrench,
  X
} from "lucide-react";

const OrderLogsModal = ({ onClose, selectedRowOrder }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const rowId = selectedRowOrder;

  const fetchLogs = async (rowId) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.ORDER_LOGS}${rowId}/logs`,
      { headers }
    );
    return response.data;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["orderLogs", rowId],
    queryFn: () => fetchLogs(rowId),
    enabled: !!rowId,
  });

  const pageCount = data ? Math.ceil(data.length / itemsPerPage) : 0;
  const displayData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  if (!selectedRowOrder) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-2xl w-[95%] md:w-[85%] max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-300">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <History className="h-6 w-6" />
            </div>
            {t("order_log")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {error ? (
            <div className="text-red-600 text-center py-8 font-bold">
              {t("failed_to_load_logs_try_again") || "Failed to load logs."}
            </div>
          ) : (
            <>
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
                          {t("customers")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2 text-nowrap">
                          <RefreshCw className="h-3.5 w-3.5 text-primary" />
                          {t("change_type")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-primary" />
                          {t("field_name")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <ChevronLeft className="h-3.5 w-3.5 text-primary" />
                          {t("old_value")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-primary" />
                          {t("new_value")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2 text-nowrap">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {t("timestamp")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2 text-nowrap">
                          <UserCircle className="h-3.5 w-3.5 text-primary" />
                          {t("user")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j} className="h-16">
                              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : displayData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                          {t("no_logs_found")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayData.map((log: any) => (
                        <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground font-medium">#{log.id}</TableCell>
                          <TableCell className="font-medium text-foreground max-w-[150px] truncate">{log.customer || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.change_type?.toLowerCase() === 'create' ? 'bg-green-100 text-green-700 border border-green-200' :
                              log.change_type?.toLowerCase() === 'update' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              log.change_type?.toLowerCase() === 'delete' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {log.change_type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground max-w-[150px] truncate">{log.field_name || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={log.old_value}>{log.old_value || "-"}</TableCell>
                          <TableCell className="text-sm text-foreground max-w-[150px] truncate" title={log.new_value}>{log.new_value || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDateTypeStamp(log.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                                {(log.user || "U").substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">{log.user}</span>
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
                ) : displayData.length === 0 ? (
                  <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                      <Info className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-muted-foreground">{t("no_logs_found")}</p>
                  </div>
                ) : (
                  displayData.map((log: any) => (
                    <div key={log.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{log.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customers")}</span>
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">{log.customer || "-"}</h3>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.change_type?.toLowerCase() === 'create' ? 'bg-green-100 text-green-700 border border-green-200' :
                          log.change_type?.toLowerCase() === 'update' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          log.change_type?.toLowerCase() === 'delete' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {log.change_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("field_name")}</span>
                          <div className="text-sm font-semibold text-foreground truncate">{log.field_name || "-"}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("user")}</span>
                          <div className="text-sm font-semibold text-foreground truncate">{log.user || "-"}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("old_value")}</span>
                          <div className="text-sm font-semibold text-muted-foreground truncate">{log.old_value || "-"}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("new_value")}</span>
                          <div className="text-sm font-semibold text-foreground truncate">{log.new_value || "-"}</div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("timestamp")}</span>
                          <div className="text-sm font-semibold text-foreground truncate">{formatDateTypeStamp(log.timestamp)}</div>
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
                      if (pageNum <= pageCount && pageNum > 0) {
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
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-muted flex justify-end gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2 shadow-md transition-all active:scale-95"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderLogsModal;

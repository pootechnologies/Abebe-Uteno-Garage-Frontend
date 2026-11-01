import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { t } from "i18next";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstanceOld from "@/api/axiosOld";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  UserCircle,
  Package,
  Wrench,
  RefreshCw,
  Calendar,
  Info,
  History
} from "lucide-react";

const PAGE_SIZE = 10;

const VehilceOldPartDeliveryLog = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vehilceOldPartDeliveryLog"],
    queryFn: async () => {
      try {
        const response = await axiosInstanceOld.get(
          API_ENDPOINTS.VEHICLE_OLDPART_DELIVERY
        );
        // Sort newest first
        return response.data.sort(
          (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      } catch (error) {
        toast.error(t("failed_to_load_logs"));
        throw error;
      }
    },
  });

  // ---- FRONTEND PAGINATION ----
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageData = data?.slice(startIndex, startIndex + PAGE_SIZE) || [];
  const totalPages = data ? Math.ceil(data.length / PAGE_SIZE) : 0;

  if (isError)
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center max-w-md">
          <p className="text-destructive font-bold">
            {t("failed_to_load_logs_try_again")}
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <History className="h-6 w-6" />
            </div>
            {t("vehicle_old_part_delivery_log")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
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
                      {t("user")}
                    </div>
                  </TableHead>

                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-primary" />
                      {t("item_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      {t("quantity")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      {t("fixed_parts")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      {t("changes_on_update")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2 text-nowrap">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("timestamp")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">{t("action")}</TableHead>
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
                ) : pageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_logs_found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData.map((log: any) => (
                    <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors border-b">
                      <TableCell className="text-muted-foreground font-medium">#{log.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                            {(log.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">{log.user}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-foreground max-w-[150px] truncate">{log.item_name || "-"}</TableCell>
                      <TableCell className="font-semibold text-foreground text-center">{log.quantity || "-"}</TableCell>
                      <TableCell className="text-sm text-foreground max-w-[150px] truncate">{log.fixed_parts || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={log.changes_on_update}>{log.changes_on_update || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground text-nowrap">{formatDateTypeStamp(log.timestamp)}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider block text-center ${
                          log.action?.toLowerCase() === 'create' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs shadow-emerald-600/10' :
                          log.action?.toLowerCase() === 'update' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-xs shadow-blue-600/10' :
                          log.action?.toLowerCase() === 'delete' ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-xs shadow-rose-600/10' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {log.action}
                        </span>
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
                 <div key={i} className="bg-card border rounded-2xl p-5 space-y-4 animate-pulse">
                   <div className="h-4 w-20 bg-muted rounded"></div>
                   <div className="h-6 w-48 bg-muted rounded"></div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-full bg-muted rounded"></div>
                      <div className="h-4 w-full bg-muted rounded"></div>
                   </div>
                 </div>
               ))
            ) : pageData.length === 0 ? (
              <div className="bg-card border rounded-2xl p-10 text-center space-y-4">
                 <div className="mx-auto w-14 h-14 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                    <Info className="h-8 w-8" />
                 </div>
                 <p className="font-semibold text-muted-foreground">{t("no_logs_found")}</p>
              </div>
            ) : (
              pageData.map((log: any) => (
                <div key={log.id} className="bg-card border rounded-2xl p-5 shadow-xs space-y-5 group hover:border-emerald-500/50 transition-all border-muted">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded leading-none">#{log.id}</span>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("item_name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 transition-colors leading-tight">{log.item_name || "-"}</h3>
                      </div>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          log.action?.toLowerCase() === 'create' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          log.action?.toLowerCase() === 'update' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          log.action?.toLowerCase() === 'delete' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {log.action}
                    </span>
                  </div>

                   <div className="grid grid-cols-2 gap-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("quantity")}</span>
                      <div className="text-sm font-bold text-foreground">{log.quantity || "-"}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("fixed_parts")}</span>
                      <div className="text-sm font-semibold text-foreground truncate">{log.fixed_parts || "-"}</div>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("changes_on_update")}</span>
                      <div className="text-xs font-medium text-muted-foreground leading-relaxed bg-muted/30 p-2 rounded-lg border border-dashed border-muted">
                        {log.changes_on_update || t("no_changes")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-muted/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary border border-primary/20">
                          {(log.user || "U").substring(0, 2).toUpperCase()}
                       </div>
                       <span className="text-[11px] font-bold text-foreground/80">{log.user}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">{formatDateTypeStamp(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Section */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-muted">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-9 gap-2 rounded-xl hover:bg-muted font-semibold transition-all px-4"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              
              <div className="flex items-center gap-1.5 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page > 3) {
                      pageNum = page - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages && pageNum > 0) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="icon"
                        className={`h-9 w-9 rounded-xl font-bold transition-all ${
                          page === pageNum 
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" 
                            : "hover:bg-muted"
                        }`}
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
                className="h-9 gap-2 rounded-xl hover:bg-muted font-semibold transition-all px-4"
              >
                 {t("next")}
                <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehilceOldPartDeliveryLog;

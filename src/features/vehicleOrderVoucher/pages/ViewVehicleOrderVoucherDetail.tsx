import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios.tsx";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PdfVehicleOrderVoucher } from "../components/PdfVehicleOrderVoucher";
import {
  User,
  Car,
  Calendar,
  Hash,
  ShieldCheck,
  Package,
  Clock,
  ArrowLeft,
  ChevronRight,
  Receipt,
  Phone,
  Briefcase,
  FileText,
  UserCheck,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Item {
  id: number;
  item_name: string;
  quantity: number;
  fixed_parts?: string;
}

interface VehicleOrderVoucherDetail {
  id: number;
  customer: number;
  vehicle: number;
  customer_name: string;
  customer_phone: string;
  customer_tin_number: string;
  vehicle_model: string;
  vehicle_shanci_kutir: string;
  vehicle_motor_kutir: string;
  vehicle_targa_kutir: string;
  ken: string;
  asrekabi_sim: number;
  asrekabi_name: string;
  asrekabi_firma: string | null;
  asrekabi_ken: string;
  terekabi_sim: number;
  terekabi_name: string;
  terekabi_firma: string | null;
  terekabi_ken: string;
  user: string;
  job_card: number;
  items: Item[];
}

const fetchVehicleOrderVoucherDetail = async (
  id: string
): Promise<VehicleOrderVoucherDetail> => {
  const response = await axiosInstance.get(`api/garage/ordervoucher/${id}/`);
  return response.data;
};

const ViewVehicleOrderVoucherDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: partRequest,
    isLoading,
    isError,
    error,
  } = useQuery<VehicleOrderVoucherDetail>({
    queryKey: ["vehicleOrderVoucher", id],
    queryFn: () => fetchVehicleOrderVoucherDetail(id!),
    enabled: !!id,
  });

  if (error) {
    toast.error(`Failed to load details: ${(error as Error).message}`);
  }

  const handleViewReceipt = async () => {
    try {
      if (!partRequest) {
        toast.error("No data available to generate receipt");
        return;
      }
      await PdfVehicleOrderVoucher(partRequest);
    } catch (error) {
      toast.error("Failed to generate receipt");
      console.error("Error generating receipt:", error);
    }
  };

  const DetailItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | undefined, color?: string }) => (
    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
      <div className={`p-2.5 rounded-lg ${color || "bg-blue-50 text-blue-600"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value || t("N/A")}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color?: string }) => (
    <div className="flex items-center space-x-2 mb-4">
      <div className={`p-1.5 rounded-lg ${color || "bg-blue-50 text-blue-600"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
  );

  if (!id) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-full"><AlertCircle className="w-12 h-12" /></div>
      <h2 className="text-xl font-bold text-gray-900">{t("Missing Order Voucher ID")}</h2>
      <Button onClick={() => navigate(-1)} variant="outline">{t("Go Back")}</Button>
    </div>
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Spinner className="w-10 h-10 text-blue-600" />
      <p className="text-gray-500 animate-pulse font-medium">{t("Loading voucher details...")}</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-full"><FileText className="w-12 h-12" /></div>
      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{t("Error loading details")}</h2>
      <Button onClick={() => navigate("/manage-vehicle-order-voucher")} variant="outline">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t("Go Back")}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Top Sticky Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate("/manage-vehicle-order-voucher")} className="cursor-pointer hover:text-blue-600 transition-colors">
                      {t("manage_vehicle_order_voucher")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-gray-900">{t("view")}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("vehicle_orders_voucher")} <span className="text-indigo-600">#{partRequest?.id}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
              </Button>
              <Button onClick={handleViewReceipt} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                <Receipt className="w-4 h-4 mr-2" /> {t("view_receipt")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Rapid Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailItem icon={User} label={t("customer")} value={partRequest?.customer_name} color="bg-indigo-50 text-indigo-600" />
          <DetailItem icon={Car} label={t("vehicle")} value={partRequest?.vehicle_targa_kutir} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={Hash} label={t("job_card_id")} value={partRequest?.job_card} color="bg-amber-50 text-amber-600" />
          <DetailItem icon={Calendar} label={t("date")} value={partRequest?.ken ? new Date(partRequest.ken).toLocaleDateString() : t("N/A")} color="bg-blue-50 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Handover Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
                <CardHeader className="bg-linear-to-br from-indigo-50/50 to-white border-b pb-4">
                  <SectionHeader icon={UserPlus} title={t("asrekabi_info")} color="bg-white text-indigo-600 shadow-sm border border-indigo-100" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("name")}</span>
                    <span className="text-sm font-bold text-gray-800">{partRequest?.asrekabi_name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("receipt")}</span>
                    <span className="text-sm font-medium text-gray-500 italic">{partRequest?.asrekabi_firma || t("No Signature")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {partRequest?.asrekabi_ken ? new Date(partRequest.asrekabi_ken).toLocaleString() : t("N/A")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
                <CardHeader className="bg-linear-to-br from-emerald-50/50 to-white border-b pb-4">
                  <SectionHeader icon={UserCheck} title={t("terekabi_info")} color="bg-white text-emerald-600 shadow-sm border border-emerald-100" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("name")}</span>
                    <span className="text-sm font-bold text-gray-800">{partRequest?.terekabi_name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("receipt")}</span>
                    <span className="text-sm font-medium text-gray-500 italic">{partRequest?.terekabi_firma || t("No Signature")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {partRequest?.terekabi_ken ? new Date(partRequest.terekabi_ken).toLocaleString() : t("N/A")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Item List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Package} title={t("items")} color="bg-amber-50 text-amber-600" />
                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border shadow-sm">
                  {partRequest?.items?.length || 0} {t("total_items")}
                </span>
              </div>
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("item_name")}</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("quantity")}</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("fixed_parts")}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {partRequest?.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                  <Package className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">{item?.item_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                {item?.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-medium text-gray-500 italic">
                                {item?.fixed_parts || "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Dynamic Customer Card */}
            <Card className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl border-none shadow-xl p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
                <User className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{t("customer")}</h3>
                  <h2 className="text-xl font-black truncate">{partRequest?.customer_name}</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 opacity-90 transition-opacity hover:opacity-100">
                    <div className="p-2 rounded-lg bg-white/10"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase">{t("phone")}</p>
                      <p className="text-sm font-bold">{partRequest?.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 opacity-90 transition-opacity hover:opacity-100">
                    <div className="p-2 rounded-lg bg-white/10"><Briefcase className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase">{t("tin_number")}</p>
                      <p className="text-sm font-bold">{partRequest?.customer_tin_number || t("N/A")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vehicle Card */}
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
               <CardHeader className="border-b bg-gray-50/30 p-6">
                 <SectionHeader icon={Car} title={t("vehicle_information")} color="bg-white text-emerald-600 shadow-sm border border-emerald-100" />
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("model")}</p>
                      <p className="text-sm font-bold text-gray-800">{partRequest?.vehicle_model}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("targa_kutir")}</p>
                      <p className="text-sm font-bold text-emerald-600 uppercase">{partRequest?.vehicle_targa_kutir}</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">{t("shanci_kutir")}</span>
                      <span className="text-gray-900 font-bold">{partRequest?.vehicle_shanci_kutir}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">{t("motor_kutir")}</span>
                      <span className="text-gray-900 font-bold">{partRequest?.vehicle_motor_kutir}</span>
                   </div>
                 </div>
               </CardContent>
            </Card>

            {/* System Info */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t("recorded_by")}</p>
                  <p className="text-sm font-bold text-gray-700">{partRequest?.user}</p>
                </div>
              </div>
              <Clock className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVehicleOrderVoucherDetail;

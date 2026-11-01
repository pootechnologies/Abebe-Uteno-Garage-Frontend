import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
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
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp.ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PdfVehicPartRequest } from "../components/PdfVehicPartRequest";
import { formatCurrency } from "@/utils/numberFormaterStats";
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
  Briefcase,
  Phone,
  FileText,
  UserPlus,
  UserCheck,
  AlertCircle,
  ClipboardList,
  CreditCard
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Item {
  id: number;
  product_name: string;
  part_number: string;
  unit_price: string;
  quantity: number;
  price: string;
}

interface PartRequestDetail {
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
  total_amount: string;
  user: string;
  job_card: number;
  items: Item[];
}

const fetchPartRequestDetail = async (
  id: string
): Promise<PartRequestDetail> => {
  const response = await axiosInstance.get(`/api/garage/partrequest/${id}/`);
  return response.data;
};

const ViewPartRequestDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: partRequest,
    isLoading,
    isError,
  } = useQuery<PartRequestDetail>({
    queryKey: ["partRequest", id],
    queryFn: () => fetchPartRequestDetail(id!),
    onError: () => toast.error(t("Failed to load part request details")),
  });

  const handleViewReceipt = async () => {
    try {
      if (!partRequest) {
        toast.error(t("No data available to generate receipt"));
        return;
      }
      await PdfVehicPartRequest({
        ...partRequest,
        items: partRequest.items.map(item => ({
          ...item,
          item_name: item.product_name,
          item_part_number: item.part_number,
        }))
      });
    } catch (error) {
      toast.error(t("Failed to generate receipt"));
      console.error("Error generating receipt:", error);
    }
  };

  const DetailItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | undefined, color?: string }) => (
    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
      <div className={`p-2.5 rounded-lg ${color || "bg-emerald-50 text-emerald-600"}`}>
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
      <div className={`p-1.5 rounded-lg ${color || "bg-emerald-50 text-emerald-600"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{title}</h3>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner className="w-10 h-10 text-emerald-600" />
        <p className="text-gray-500 animate-pulse font-medium">{t("Loading part request details...")}</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{t("Error loading details")}</h2>
        <Button onClick={() => navigate("/manage-vehicle-part-request")} variant="outline">
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
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("manage_part_requests")} <span className="text-emerald-600">#{partRequest?.id}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
              </Button>
              <Button onClick={handleViewReceipt} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200">
                <Receipt className="w-4 h-4 mr-2" /> {t("view_receipt")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailItem icon={User} label={t("customer")} value={partRequest?.customer_name} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={User} label={t("organization")} value={partRequest?.customer_organization || t("N/A")} color="bg-amber-50 text-amber-600" />

          <DetailItem icon={Car} label={t("vehicle")} value={partRequest?.vehicle_targa_kutir} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={Hash} label={t("job_card_id")} value={partRequest?.job_card} color="bg-amber-50 text-amber-600" />
          <DetailItem icon={CreditCard} label={t("total_amount")} value={`ETB ${parseFloat(partRequest?.total_amount || "0").toLocaleString()}`} color="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Handover Cards */}
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
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {partRequest?.asrekabi_ken ? formatDateTypeStamp(partRequest.asrekabi_ken) : t("N/A")}
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
                    <span className="text-xs font-semibold text-gray-400 uppercase">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {partRequest?.terekabi_ken ? formatDateTypeStamp(partRequest.terekabi_ken) : t("N/A")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Item List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <SectionHeader icon={Package} title={t("item_list")} color="bg-amber-50 text-amber-600" />
                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border shadow-sm">
                  {partRequest?.items?.length || 0} {t("total_items")}
                </span>
              </div>
              <Card className="border-none shadow-sm rounded-2xl overflow-y-scroll max-h-[500px]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("id")}</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("product_name")}</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("part_number")}</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("quantity")}</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("unit_price")}</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("total_price")}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {partRequest?.items?.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                               
                                <span className="text-sm font-bold text-gray-800">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 ">
                                  <Package className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">{item.product_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-500 uppercase">{item.part_number}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-gray-700">{formatCurrency(item.unit_price)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-black text-emerald-600">{formatCurrency(item.price)}</span>
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
            {/* Customer Card */}
            <Card className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl border-none shadow-xl p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
                <User className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{t("customer")}/{t("organization")}</h3>
                  <h2 className="text-xl font-black truncate">{partRequest?.customer_name}/{partRequest?.customer_organization}</h2>
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
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("model")}</p>
                    <p className="text-sm font-bold text-gray-800">{partRequest?.vehicle_model}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("targa_kutir")}</p>
                    <p className="text-sm font-bold text-emerald-600 uppercase">{partRequest?.vehicle_targa_kutir}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-500 font-medium">{t("shanci_kutir")}</span>
                    <span className="text-gray-900 font-bold">{partRequest?.vehicle_shanci_kutir}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-gray-500 font-medium">{t("motor_kutir")}</span>
                    <span className="text-gray-900 font-bold">{partRequest?.vehicle_motor_kutir}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors border-t pt-4">
                    <span className="text-gray-500 font-medium">{t("service_date")}</span>
                    <span className="text-emerald-600 font-bold">{partRequest?.ken ? formatDateTypeStamp(partRequest.ken) : t("N/A")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Details Footer */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
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

export default ViewPartRequestDetail;

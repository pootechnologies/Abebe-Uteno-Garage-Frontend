import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios.tsx";
import { toast } from "react-hot-toast";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp.ts";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  User,
  Car,
  Calendar,
  Hash,
  UserCheck,
  UserPlus,
  Wrench,
  Package,
  Clock,
  ArrowLeft,
  Receipt,
  History,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { PdfVehicleOldPartDelivery } from "../components/PdfVehicleDelivery";

interface Item {
  id: number;
  item_name: string;
  quantity: number;
  fixed_parts: string;
  product_name: string;
}

interface VehicleOldPartDetail {
  id: number;
  job_card?: number | null;
  model: string;
  ye_bale_nibret_sim: string;
  shanci_kutir: string;
  motor_kutir: string;
  targa_kutir: string;
  silk_kutir: string;
  tin_kutir: string;
  ken: string;
  asrekabi_sim: string;
  asrekabi_name: string;
  asrekabi_firma: string;
  asrekabi_ken: string;
  terekabi_name: string;
  terekabi_firma: string;
  terekabi_ken: string;
  tegagn_mechanic_name: string;
  user: string;
  items: Item[];
  vehicle_model: string;
  vehicle_shanci_kutir: string;
  vehicle_motor_kutir: string;
  vehicle_targa_kutir: string;
  customer_name: string;
  customer_phone: string;
  customer_tin_number: string;
  terekabi_phone?: string | null;
  terekabi_tin_number?: string | null;
  terekabi_organization?: string | null;
}

const fetchVehicleOldPartDetail = async (
  id: string
): Promise<VehicleOldPartDetail> => {
  const response = await axiosInstance.get(`api/garage/oldpart/${id}/`);
  return response.data;
};

const ViewVehicleOldPartDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vehicleOldPartDetail", id],
    queryFn: () => fetchVehicleOldPartDetail(id!),
  });

  if (error) {
    console.error("Error fetching part request details:", error);
  }

  const oldPart = data as VehicleOldPartDetail | undefined;

  const handleViewReceipt = async () => {
    try {
      if (!oldPart) {
        toast.error(t("No data available to generate receipt"));
        return;
      }
      await PdfVehicleOldPartDelivery(oldPart);
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
        <span className="text-sm font-bold text-gray-900">{value ?? t("N/A")}</span>
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color?: string }) => (
    <div className="flex items-center space-x-2 mb-4">
      <div className={`p-1.5 rounded-lg ${color || "bg-emerald-50 text-emerald-600"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner className="w-10 h-10 text-emerald-600" />
        <p className="text-gray-500 animate-pulse font-medium">{t("Loading details...")}</p>
      </div>
    );

  if (isError || !oldPart)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-full"><AlertCircle className="w-12 h-12" /></div>
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{t("Error loading details")}</h2>
        <Button onClick={() => navigate("/manage-vehicle-old-part")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("Go Back")}
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <History className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("vehicle_old_part")} <span className="text-emerald-600">#{oldPart?.id}</span>
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
        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailItem icon={User} label={t("customer")} value={oldPart?.terekabi_name} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={User} label={t("organization")} value={oldPart?.terekabi_organization} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={Car} label={t("vehicle")} value={oldPart?.vehicle_targa_kutir} color="bg-emerald-50 text-emerald-600" />
          <DetailItem icon={Hash} label={t("job_card_id")} value={oldPart?.job_card} color="bg-amber-50 text-amber-600" />
          <DetailItem icon={Calendar} label={t("date")} value={formatDateTypeStamp(oldPart.ken)} color="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Handover Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
                <CardHeader className="bg-linear-to-br from-emerald-50/50 to-white border-b pb-4">
                  <SectionHeader icon={UserPlus} title={t("asrekabi_info")} color="bg-white text-emerald-600 shadow-sm border border-emerald-100" />
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">{t("name")}</span>
                    <span className="text-sm font-bold text-gray-800">{oldPart.asrekabi_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">{formatDateTypeStamp(oldPart.asrekabi_ken)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
                <CardHeader className="bg-linear-to-br from-emerald-50/50 to-white border-b pb-4">
                  <SectionHeader icon={UserCheck} title={t("terekabi_info")} color="bg-white text-emerald-600 shadow-sm border border-emerald-100" />
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">{t("name")}</span>
                    <span className="text-sm font-bold text-gray-800">{oldPart.terekabi_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500 font-medium">{t("date")}</span>
                    <span className="text-sm font-bold text-gray-800">{formatDateTypeStamp(oldPart.terekabi_ken)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Old Parts List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={History} title={t("Old Parts (Removed Items)")} color="bg-emerald-50 text-emerald-600" />
                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border shadow-sm">
                  {oldPart?.items?.length || 0} {t("items")}
                </span>
              </div>
              <Card className="border-none shadow-sm rounded-2xl overflow-y-scroll max-h-[500px]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("id")}</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("item_name")}</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("part_number")}</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("quantity")}</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("fixed_parts")}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {oldPart?.items?.map((item, index) => (
                          <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
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
                                <span className="text-sm font-bold text-gray-800">{item?.product_name}</span>
                              </div>
                              
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-500 uppercase">{item.part_number}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {item?.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-medium text-gray-500 italic">
                                {item?.fixed_parts || "N/A"}
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

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tech Card */}
            <Card className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl border-none shadow-xl p-6 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
                <Wrench className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">{t("tegagn_mechanic")}</h3>
                  <h2 className="text-xl font-black truncate">{oldPart?.tegagn_mechanic_name}</h2>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">{t("Identity Verified")}</p>
                      <p className="text-xs font-medium">{t("Certified Garage Mechanic")}</p>
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
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("model")}</p>
                    <p className="text-sm font-bold text-gray-800">{oldPart.vehicle_model}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("targa_kutir")}</p>
                    <p className="text-sm font-bold text-emerald-600 uppercase">{oldPart.vehicle_targa_kutir}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">{t("shanci_kutir")}</span>
                    <span className="text-gray-900 font-bold">{oldPart.vehicle_shanci_kutir}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">{t("motor_kutir")}</span>
                    <span className="text-gray-900 font-bold">{oldPart.vehicle_motor_kutir}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recorded By */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t("recorded_by")}</p>
                  <p className="text-sm font-bold text-gray-700">{oldPart.user}</p>
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

export default ViewVehicleOldPartDetail;

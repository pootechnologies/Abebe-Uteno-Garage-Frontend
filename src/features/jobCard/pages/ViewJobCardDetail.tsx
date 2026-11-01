import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { createRoot } from "react-dom/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { BlobProvider } from "@react-pdf/renderer";
import { fetchJobCardDetails } from "../api/jobCard.ts";
import JobcardReceiptPDF from "../components/JobcardReceiptPDF";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import axiosInstance from "@/api/axios.tsx";
import {
  User,
  Car,
  Calendar,
  Gauge,
  CreditCard,
  CheckCircle,
  Clock,
  Wrench,
  Package,
  History,
  Receipt,
  ArrowLeft,
  FileText,
  ChevronRight,
  ClipboardList,
  Building2
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const ViewJobCardDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: jobCardDetails,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["jobCardDetails", id],
    queryFn: () => fetchJobCardDetails(id!),
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        await axiosInstance.get(
          `api/garage/${API_ENDPOINTS.COMPANY}`
        );
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return t("N/A") || "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewReceipt = async () => {
    if (!jobCardDetails) {
      toast.error(t("job_card_missing") || "Job card data is missing.");
      return;
    }
    const jobCardId = jobCardDetails.id;
    try {
      const response = await axiosInstance.get(
        `api/garage/jobcard-receipt/${jobCardId}/`
      );
      const fetchedData = response.data;
      const div = document.createElement("div");
      document.body.appendChild(div);
      const root = createRoot(div);
      root.render(
        <BlobProvider
          document={
            <JobcardReceiptPDF
              company={fetchedData.company}
              customer={fetchedData.customer}
              vehicle={fetchedData.vehicle}
              jobcard_details={fetchedData.jobcard_details}
              assignments={fetchedData.assignments}
              part_request={fetchedData.part_request}
              totals={fetchedData.totals}
            />
          }
        >
          {({ url }) => {
            if (url) {
              window.open(url, "_blank");
              root.unmount();
              document.body.removeChild(div);
            }
            return null;
          }}
        </BlobProvider>
      );
    } catch (error) {
      console.error("Error fetching job card receipt data:", error);
      toast.error(t("Failed to fetch job card receipt data.") || "Failed to fetch job card receipt data.");
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
      pending: "bg-sky-100 text-sky-700 border-sky-200",
      "in progress": "bg-amber-100 text-amber-700 border-amber-200",
      "in_progress": "bg-amber-100 text-amber-700 border-amber-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      cancelled: "bg-rose-100 text-rose-700 border-rose-200",
      scheduled: "bg-sky-100 text-sky-700 border-sky-200",
      waiting_parts: "bg-amber-100 text-amber-700 border-amber-200",
    };

    const colorClass = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colorClass} capitalize tracking-wider`}>
        {status}
      </span>
    );
  };

  const DetailItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | undefined, color?: string }) => (
    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white hover:shadow-sm min-w-0">
      <div className={`p-2.5 rounded-lg shrink-0 shadow-xs ${color || "bg-emerald-50 text-emerald-600"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{label}</span>
        <span className="text-sm font-bold text-gray-900 break-words">{value}</span>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse font-medium">{t("Loading...") || "Loading job card details..."}</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
          <FileText className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t("Oops! Something went wrong") || "Oops! Something went wrong"}</h2>
        <p className="text-gray-500">{t("We couldn't load the job card details. Please try again.") || "We couldn't load the job card details. Please try again."}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("Go Back") || "Go Back"}
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
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate("/manage-job-card")} className="cursor-pointer hover:text-emerald-600 font-medium transition-colors">
                      {t("manage_job_cards")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-gray-900">{t("view")}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-md shadow-emerald-200">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("job_card")} <span className="text-emerald-600">#{jobCardDetails?.id}</span>
                </h1>
                {jobCardDetails && <StatusBadge status={jobCardDetails.status} />}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200 font-semibold shadow-xs">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back") || "Back"}
              </Button>
              {/* <Button onClick={handleViewReceipt} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                <Receipt className="w-4 h-4 mr-2" /> {t("view_receipt") || "View Receipt"}
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Summary Grid */}
        {jobCardDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <DetailItem 
              icon={User} 
              label={t("customer")} 
              value={jobCardDetails.customer_name} 
              color="bg-emerald-50 text-emerald-600"
            />
            <DetailItem 
              icon={Building2} 
              label={t("organization")} 
              value={jobCardDetails.organization || "N/A"} 
              color="bg-blue-50 text-blue-600"
            />
            <DetailItem 
              icon={Car} 
              label={t("vehicle")} 
              value={jobCardDetails.vehicle_plate ? `${jobCardDetails.vehicle_info} - ${jobCardDetails.vehicle_plate}` : jobCardDetails.vehicle_info} 
              color="bg-emerald-50 text-emerald-600"
            />
            <DetailItem 
              icon={Calendar} 
              label={t("service_date")} 
              value={formatDate(jobCardDetails.service_date)} 
              color="bg-amber-50 text-amber-600"
            />
            <DetailItem 
              icon={Gauge} 
              label={t("mileage")} 
              value={`${jobCardDetails.odometer_reading?.toLocaleString() || 0} km`} 
              color="bg-rose-50 text-rose-600"
            />
            <DetailItem 
              icon={CreditCard} 
              label={t("total_service_cost")} 
              value={`ETB ${parseFloat(jobCardDetails.total_cost).toLocaleString()}`} 
              color="bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Assignments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-emerald-600" />
                {t("assignments")}
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-xs">
                {jobCardDetails?.assignments?.length || 0} {t("assignments") || "Assignments"}
              </span>
            </div>

            <div className="space-y-6">
              {jobCardDetails?.assignments?.map((assignment: any) => (
                <Card key={assignment.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
                  <header className="bg-linear-to-r from-gray-50/80 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-100">
                        <User className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t("worker")}</p>
                        <h4 className="text-base font-bold text-gray-900 leading-tight">{assignment.worker_name}</h4>
                      </div>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </header>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {assignment.service_package_name && (
                        <div className="flex items-start space-x-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="mt-1"><Package className="w-4 h-4 text-emerald-600" /></div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{t("service_package")}</p>
                            <p className="text-sm font-bold text-gray-800">{assignment.service_package_name}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start space-x-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <div className="mt-1"><Clock className="w-4 h-4 text-emerald-600" /></div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">{t("task_description")}</p>
                          <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                            {assignment.task_description || t("N/A") || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {assignment.assigned_services.length > 0 && (
                      <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-2" />
                          {t("assigned_services")}
                        </h5>
                        <div className="space-y-3">
                          {assignment.assigned_services.map((service: any) => (
                            <div key={service.id} className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex justify-between items-center group hover:border-emerald-200 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full shadow-sm ${service.status.toLowerCase() === 'completed' ? 'bg-emerald-500' : 'bg-sky-400 animate-pulse'}`} />
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{service.service_name}</p>
                                  <div className="flex items-center text-[10px] text-gray-400 font-bold mt-1 tracking-wider uppercase">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {service.started_at ? formatDate(service.started_at) : (t("Not started") || "Not started")}
                                    {service.completed_at && (
                                      <>
                                        <ChevronRight className="w-3 h-3 mx-1" />
                                        {formatDate(service.completed_at)}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border tracking-widest uppercase ${
                                  service.status.toLowerCase() === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                  : service.status.toLowerCase() === 'in_progress' || service.status.toLowerCase() === 'in progress'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-sky-50 text-sky-600 border-sky-100'
                                }`}>
                                  {service.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Column - Parts & History */}
          <div className="space-y-8">
            {/* Parts Requests */}
            {jobCardDetails?.vehicle_part_requests && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-emerald-600" />
                  {t("requested_parts")}
                </h2>
                <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                    {/* <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{jobCardDetails.vehicle_part_requests.id}</div> */}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                      {jobCardDetails.vehicle_part_requests.items.map((item: any) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-bold text-gray-900 leading-tight pr-4">{item.product_name}</h5>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">x{item.quantity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("Unit") || "UNIT"}: ETB {item.unit_price}</p>
                            <p className="text-sm font-extrabold text-gray-700">ETB {item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("total") || "Total"}</div>
                      <div className="text-sm font-black text-emerald-600">ETB {jobCardDetails.vehicle_part_requests.total_amount}</div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Old Parts */}
            {jobCardDetails?.vehicle_old_parts && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-rose-600" />
                  {t("vehicle_old_part")}
                </h2>
                <Card className="border border-rose-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="divide-y divide-rose-50">
                      {jobCardDetails.vehicle_old_parts.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex justify-between items-center hover:bg-rose-50/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-xs" />
                            <h5 className="text-sm font-bold text-gray-900">{item.product_name}</h5>
                          </div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            {item.quantity} {t("piece")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Notes Section */}
            {jobCardDetails?.notes && (
              <Card className="bg-emerald-600 rounded-2xl border-none shadow-lg shadow-emerald-200/50 p-6 text-white relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 opacity-10 transform rotate-12 transition-transform duration-500 group-hover:scale-125">
                  <FileText className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-80">{t("Engineer Notes") || "Engineer Notes"}</h3>
                  <p className="text-base font-semibold leading-relaxed italic opacity-95">
                  "{jobCardDetails.notes}"
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJobCardDetail;

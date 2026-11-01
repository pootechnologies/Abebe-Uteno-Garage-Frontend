import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { useAbility } from "@/context/AbilityContext";
import {
  Users,
  Car,
  CalendarCheck,
  AlertTriangle,
  Info,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import OutOfStockSheet from "../components/OutOfStockSheet";
import RecentActivities from "../components/RecentActivities";
import { t } from "i18next";
import JobCardPie from "@/features/jobCard/components/JobCardBar";
import useUserStore from "@/stores/useUserStore";
import { formatCurrency, formatCompact } from "@/utils/numberFormaterStats";
import ChartData from "../components/ChartData";

// Fetch functions
const fetchCustomers = async () => await axiosInstance.get("api/garage/total-customer/");
const fetchVehicles = async () => await axiosInstance.get("api/garage/total-vehicle/");
const fetchVehicleAcceptance = async () => await axiosInstance.get("api/garage/total-acceptance");
const fetchOutStockProducts = async () => (await axiosInstance.get("api/garage/products/"))?.data?.results;
const fetchTotalOrders = async () => (await axiosInstance.get("api/garage/total-order/")).data;
const fetchJobCardScheduled = async () => (await axiosInstance.get("api/garage/jobcard-status-scheduled/")).data;
const fetchJobCardInProgress = async () => (await axiosInstance.get("api/garage/jobcard-status-in-progress/")).data;
const fetchJobCardCompleted = async () => (await axiosInstance.get("api/garage/jobcard-status-completed/")).data;
const fetchTotalRevenue = async () => (await axiosInstance.get("api/garage/total-revenue/"))?.data?.total_revenue;

export default function Dashboard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ability = useAbility();
  const user = useUserStore((state) => state.user);

  // Show premium loading state
  if (!user?.role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-lg font-medium text-gray-500 animate-pulse">{t("loading")}...</p>
      </div>
    );
  }

  // Check user roles
  const isManager = ability.can("read", "Accounts");
  const isStockManager =
    ability.can("manage", "Product") &&
    ability.can("manage", "Order") &&
    ability.can("manage", "Category");
  const isTechnicalExaminer = ability.can("read", "TechnicalExaminer");
  const isCustomerOfficer = ability.can("read", "Supplier");
  const isFieldOperator =
    ability.can("manage", "VehicleAcceptance") &&
    ability.can("read", "Customer");

  // Queries - only for required cards
  const { data: customers, isLoading: loadingCustomers } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const { data: vehicleAcceptance, isLoading: loadingVehicleAcceptance } = useQuery({ queryKey: ["vehicleAcceptance"], queryFn: fetchVehicleAcceptance });
  const { data: outStockProducts, isLoading: loadingOutStockProducts } = useQuery({ queryKey: ["outStockProducts"], queryFn: fetchOutStockProducts });
  const { data: totalOrders, isLoading: loadingTotalOrders } = useQuery({ queryKey: ["totalOrders"], queryFn: fetchTotalOrders });
  const { data: jobCardScheduled, isLoading: loadingJobCardScheduled } = useQuery({ queryKey: ["jobCardScheduled"], queryFn: fetchJobCardScheduled });
  const { data: jobCardInProgress, isLoading: loadingJobCardInProgress } = useQuery({ queryKey: ["jobCardInProgress"], queryFn: fetchJobCardInProgress });
  const { data: jobCardCompleted, isLoading: loadingJobCardCompleted } = useQuery({ queryKey: ["jobCardCompleted"], queryFn: fetchJobCardCompleted });
  const { data: totalRevenue, isLoading: loadingTotalRevenue } = useQuery({ queryKey: ["totalRevenue"], queryFn: fetchTotalRevenue });

  const lowStockProducts = outStockProducts?.filter((p: any) => p.stock < 4) || [];

  // Enhanced premium status cards (excluding job card stats — shown separately)
  const statusCards = [
    {
      title: t("customers"),
      count: customers?.data || 0,
      loading: loadingCustomers,
      icon: Users,
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
      iconBg: "bg-blue-100/80 text-blue-600",
    },
    {
      title: t("vehicles"),
      count: vehicles?.data || 0,
      loading: loadingVehicles,
      icon: Car,
      color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
      iconBg: "bg-indigo-100/80 text-indigo-600",
    },
    {
      title: t("out_of_stock"),
      count: lowStockProducts.length,
      loading: loadingOutStockProducts,
      icon: AlertTriangle,
      color: "from-rose-500/10 to-rose-500/5 border-rose-500/20",
      iconBg: "bg-rose-100/80 text-rose-600",
      hasInfo: true,
    },
    {
      title: t("total_orders"),
      count: totalOrders || 0,
      loading: loadingTotalOrders,
      icon: FileText,
      color: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
      iconBg: "bg-cyan-100/80 text-cyan-600",
    },
    {
      title: t("total_revenue"),
      count: formatCompact(totalRevenue) || 0,
      loading: loadingTotalRevenue,
      icon: DollarSign,
      color: "from-emerald-600/10 to-emerald-600/5 border-emerald-600/20",
      iconBg: "bg-emerald-100/80 text-emerald-600",
    },
    {
      title: t("vehicle_acceptance"),
      count: vehicleAcceptance?.data || 0,
      loading: loadingVehicleAcceptance,
      icon: CalendarCheck,
      color: "from-sky-500/10 to-sky-500/5 border-sky-500/20",
      iconBg: "bg-sky-100/80 text-sky-600",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-500 tracking-tight">
            {t("dashboard")}
          </h2>
          <p className="text-gray-500 mt-2 font-medium text-lg">
            Welcome back, overview of your garage operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statusCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative"
          >
            {/* Left: icon + label */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.iconBg} flex-shrink-0`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  {card.title}
                </p>
                {card.loading ? (
                  <div className="animate-pulse mt-1.5 h-8 w-20 bg-gray-100 rounded-md" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.count}
                  </p>
                )}
              </div>
            </div>

            {/* Info button for out-of-stock */}
            {card.hasInfo && (
              <div
                onClick={() => setSheetOpen(true)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                title="View out of stock items"
              >
                <Info className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        ))}
      </div>


      {/* Job Cards — Combined Summary Card (Full Width) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm py-6 px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900">{t("job_cards") || "Job Cards"}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("track_today_workflow") || "Track today's workflow"}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-gray-200 justify-end w-full md:w-auto">
            <div className="py-4 sm:py-0 sm:px-8 text-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">{t("scheduled") || "Scheduled"}</p>
              {loadingJobCardScheduled ? (
                <div className="animate-pulse mt-2 h-9 w-16 bg-gray-100 rounded-md mx-auto" />
              ) : (
                <h3 className="mt-2 text-3xl font-bold text-gray-900">{jobCardScheduled || 0}</h3>
              )}
            </div>

            <div className="py-4 sm:py-0 sm:px-8 text-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wider text-amber-500 font-medium">{t("in_progress") || "In Progress"}</p>
              {loadingJobCardInProgress ? (
                <div className="animate-pulse mt-2 h-9 w-16 bg-gray-100 rounded-md mx-auto" />
              ) : (
                <h3 className="mt-2 text-3xl font-bold text-gray-900">{jobCardInProgress || 0}</h3>
              )}
            </div>

            <div className="py-4 sm:py-0 sm:px-8 text-center min-w-[120px]">
              <p className="text-xs uppercase tracking-wider text-emerald-500 font-medium">{t("completed") || "Completed"}</p>
              {loadingJobCardCompleted ? (
                <div className="animate-pulse mt-2 h-9 w-16 bg-gray-100 rounded-md mx-auto" />
              ) : (
                <h3 className="mt-2 text-3xl font-bold text-gray-900">{jobCardCompleted || 0}</h3>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Activities grid (Left & Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ChartData (Left - 2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm pt-6 px-2 pb-4">
          <div className="flex justify-between items-center mb-2 px-6">
            <h2 className="text-xl font-bold text-gray-800">
              {t("sales_overview") || "Sales Overview"}
            </h2>
          </div>
          <ChartData />
        </div>

        {/* RecentActivities (Right - 1/3 width) */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
      </div>

      <OutOfStockSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        products={lowStockProducts}
      />
    </div>
  );
}


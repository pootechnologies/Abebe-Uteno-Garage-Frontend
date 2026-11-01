import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { ShoppingBag } from "lucide-react";
import { CircularProgress } from "@mui/material";

const RecentActivities = () => {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch recent activities (orders) using TanStack Query
  const {
    data: recentActivities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.RECENT_ORDERS}`,
        {
          headers: getAuthHeader(),
        }
      );

      // Map the response data to our custom format for display
      return response.data
        .map((order) => ({
          id: order.id,
          name: order.customer_name,
          type: "Order",
          description: `${t("new_order_placed_with")} ${order.items.length} ${t(
            "items_totaling_etb"
          )} ${formatCurrency(order.total_amount)}`,
          date: new Date(order.order_date), // Store date as Date object
        }))
        .sort((a, b) => b.date - a.date) // Sort by date in descending order
        .slice(0, 10); // Limit to the 10 most recent activities
    },
    refetchOnWindowFocus: true,
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-red-500">
        Error fetching recent activities
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {t("recent_order_activities")}
      </h2>
      <div className="min-h-[480px] max-h-[480px] overflow-y-auto flex flex-col">
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-400">
            <div className="p-5 bg-gray-100 rounded-full">
              <ShoppingBag size={36} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">{t("no_data_found") || "No data found"}</p>
          </div>
        ) : (
          recentActivities.map((activity, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <ShoppingBag className="text-indigo-600" size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-gray-900">{activity.name}</strong>
                    <span className="text-xs text-gray-500">
                      {activity.date.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { t } from "i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { CircularProgress } from "@mui/material";

// Register necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const fetchOrders = async (access_token) => {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ORDERS}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    return response.data;
};

const fetchWeeklyOrders = async (access_token) => {
    const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.WEEKLY_SALES_MANAGER}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    return response.data;
};

const fetchMonthlyOrders = async (access_token) => {
    const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.MONTHLY_SALES_MANAGER}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    return response.data;
};

const fetchYearlyOrders = async (access_token) => {
    const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.YEARLY_SALES_MANAGER}`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );
    return response.data;
};

const ChartData = () => {
    const [period, setPeriod] = useState("weekly");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const access_token = localStorage.getItem("access_token");

    const {
        data: orders = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["orders"],
        queryFn: () => fetchOrders(access_token),
    });

    const {
        data: weeklyOrders = [],
        isLoading: weeklyOrdersLoading,
        isError: weeklyOrdersError,
    } = useQuery({
        queryKey: ["weeklyOrders"],
        queryFn: () => fetchWeeklyOrders(access_token),
    });

    const {
        data: monthlyOrders = [],
        isLoading: monthlyOrdersLoading,
        isError: monthlyOrdersError,
    } = useQuery({
        queryKey: ["monthlyOrders"],
        queryFn: () => fetchMonthlyOrders(access_token),
    });

    const {
        data: yearlyOrders = [],
        isLoading: yearlyOrdersLoading,
        isError: yearlyOrdersError,
    } = useQuery({
        queryKey: ["yearlyOrders"],
        queryFn: () => fetchYearlyOrders(access_token),
    });

    // const availableDates = orders.map((order) => new Date(order.order_date));
    // const minDate = availableDates.length > 0 ? new Date(Math.min(...availableDates)) : null;
    // const maxDate = availableDates.length > 0 ? new Date(Math.max(...availableDates)) : null;

    // const totalAmount = orders.reduce(
    //   (sum, order) => sum + parseFloat(order.total_amount),
    //   0
    // );

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    const handleDateChange = () => {
        if (startDate && endDate) {
            // Filter logic can be added here if needed
        } else {
            alert("Please select both start date and end date.");
        }
    };

    const getChartData = () => {
        let data = [];
        switch (period) {
            case "weekly":
                data = weeklyOrders;
                break;
            case "monthly":
                data = monthlyOrders;
                break;
            case "yearly":
                data = yearlyOrders;
                break;
            default:
                data = [];
        }
        return data;
    };

    const chartData = getChartData();

    const chartJsData = {
        labels: chartData.map((item) => item.period),
        datasets: [
            {
                label: t("sales"),
                data: chartData.map((item) => item.sales),
                backgroundColor: "rgba(138, 132, 216, 0.6)",
                borderColor: "rgba(138, 132, 216, 1)",
                borderWidth: 1,
            },
        ],
    };

    if (isLoading || weeklyOrdersLoading || monthlyOrdersLoading || yearlyOrdersLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (isError || weeklyOrdersError || monthlyOrdersError || yearlyOrdersError) {
        return <div>Error fetching data</div>;
    }

    return (
        <div className="w-full p-5">
            <div className="mb-4 flex flex-wrap gap-2 justify-end w-full">
                <Button
                    onClick={() => handlePeriodChange("weekly")}
                    className={`rounded-xl px-4 py-2 transition-all duration-200 ${
                        period === "weekly"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                    {t("weekly")}
                </Button>
                <Button
                    onClick={() => handlePeriodChange("monthly")}
                    className={`rounded-xl px-4 py-2 transition-all duration-200 ${
                        period === "monthly"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                    {t("monthly")}
                </Button>
                <Button
                    onClick={() => handlePeriodChange("yearly")}
                    className={`rounded-xl px-4 py-2 transition-all duration-200 ${
                        period === "yearly"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                    {t("yearly")}
                </Button>
            </div>
            {/* <div className="flex flex-col space-y-2">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
          placeholderText={t("start_date")}
          minDate={minDate}
          maxDate={maxDate}
          includeDates={availableDates}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
          placeholderText={t("end_date")}
          minDate={minDate}
          maxDate={maxDate}
          includeDates={availableDates}
        />
        <div className="flex space-x-6 justify-end">
          <Button onClick={handleDateChange} className="w-auto text-white">
            {t("filter")}
          </Button>
          <Button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            className="w-auto text-white"
          >
            {t("clear")}
          </Button>
        </div>
      </div> */}

            <div className="w-full h-[400px] sm:h-[400px] md:h-[400px]">
                <Bar
                    data={chartJsData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: "top" },
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => tooltipItem.raw.toString(),
                                },
                            },
                        },
                        elements: {
                            bar: {
                                borderRadius: {
                                    topLeft: 5,
                                    topRight: 5,
                                    bottomLeft: 2,
                                    bottomRight: 60,
                                },
                            },
                        },
                    }}
                />
            </div>
            {/* 
      <div className="mt-4 p-4 border max-w-screen-sm mx-auto text-center rounded-lg">
        <h2 className="text-lg font-semibold">
          {startDate && endDate
            ? `${t("selected_date_total")}: ${formatCurrency(totalAmount.toFixed(2))}`
            : `${t("total_sales")}: ${formatCurrency(totalAmount.toFixed(2))}`}
        </h2>
      </div> */}
        </div>
    );
};

export default ChartData;
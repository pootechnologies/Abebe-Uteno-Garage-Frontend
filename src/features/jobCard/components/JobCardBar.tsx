"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { t } from "i18next";
// Fetch functions
const fetchJobCardScheduled = async () =>
  (await axiosInstance.get("api/garage/jobcard-status-scheduled/")).data;

const fetchJobCardInProgress = async () =>
  (await axiosInstance.get("api/garage/jobcard-status-in-progress/")).data;

const fetchJobCardCompleted = async () =>
  (await axiosInstance.get("api/garage/jobcard-status-completed/")).data;

export default function JobCardBar() {
  // Fetch job card status data
  const { data: scheduled, isLoading: loadingScheduled } = useQuery({
    queryKey: ["jobCardScheduled"],
    queryFn: fetchJobCardScheduled,
  });

  const { data: inProgress, isLoading: loadingInProgress } = useQuery({
    queryKey: ["jobCardInProgress"],
    queryFn: fetchJobCardInProgress,
  });

  const { data: completed, isLoading: loadingCompleted } = useQuery({
    queryKey: ["jobCardCompleted"],
    queryFn: fetchJobCardCompleted,
  });

  // Prepare chart data
  const chartData = [
    {
      status: "Scheduled",
      value: scheduled || 0,
    },
    {
      status: "In Progress",
      value: inProgress || 0,
    },
    {
      status: "Completed",
      value: completed || 0,
    },
  ];

  const chartConfig = {
    value: {
      label: "Jobs",
      color: "(var(--chart-2)",
    },
  };

  // Show loading state while data is being fetched
  if (loadingScheduled || loadingInProgress || loadingCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("job_card_status")}</CardTitle>
          <CardDescription>Loading job data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status</CardTitle>
        <CardDescription>Current Job Overview</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill="var(--chart-2)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

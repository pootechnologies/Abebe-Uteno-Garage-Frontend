import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTasks,
  updateAssignedService,
  updateServicePackage,
} from "../api/tasks.ts";
import { Box } from "@mui/material";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner.tsx";

// --- Types ---
type ServiceDetail = {
  id: number;
  name: string;
  description: string;
  cost: string;
  Finishing_date: string;
  duration: number;
  user: string;
};

type Service = {
  id: number; // outer id
  status: "in_progress" | "completed" | "scheduled";
  service?: ServiceDetail;
  started_at?: string | null;
  completed_at?: string | null;
};

type JobCard = {
  id: number;
  customer_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  status?: string;
  service_date?: string;
  odometer_reading?: number;
  total_cost?: string;
  user?: string;
};

type Task = {
  id: number;
  status: "in_progress" | "completed" | "scheduled";
  worker: string;
  worker_name?: string;
  job_card: JobCard;
  assigned_services: Service[];
  task_description: string;
  service_package?: number | null;
  service_package_name?: string;
  package_status?: "in_progress" | "completed" | "scheduled";
};

// --- Component ---
const Tasks: React.FC = () => {
  const { data, error, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    in_progress: 0,
    completed: 0,
    scheduled: 0,
  });

  useEffect(() => {
    if (data) {
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setTasks(sorted);
      setFilteredTasks(sorted);
      calculateStatusCounts(sorted);
    }
  }, [data]);

  const calculateStatusCounts = (tasks: Task[]) => {
    const counts = {
      all: tasks.length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      scheduled: tasks.filter((t) => t.status === "scheduled").length,
    };
    setStatusCounts(counts);
  };

  useEffect(() => {
    let result = [...tasks];
    if (filterStatus !== "all")
      result = result.filter((t) => t.status === filterStatus);
    setFilteredTasks(result);
  }, [filterStatus, tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Fixed handleStatusChange ---
  const handleStatusChange = async (
    taskId: number,
    serviceId: number | null,
    newStatus: "in_progress" | "completed" | "scheduled"
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (serviceId) {
            const updatedServices = task.assigned_services.map((s) =>
              s.service?.id === serviceId ? { ...s, status: newStatus } : s
            );
            return { ...task, assigned_services: updatedServices };
          } else {
            return { ...task, package_status: newStatus };
          }
        }
        return task;
      })
    );

    try {
      if (serviceId) await updateAssignedService(taskId, serviceId, newStatus);
      else await updateServicePackage(taskId, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (isLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Spinner />
      </Box>
    );

  if (error instanceof Error)
    return (
      <div>
        {t("error_fetching_tasks")}: {error.message}
      </div>
    );

  return (
    <div className="p-5">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
        {t("my_tasks")}
      </h3>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        {["all", "in_progress", "completed", "scheduled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded whitespace-nowrap flex items-center uppercase ${
              filterStatus === status ? "bg-gray-500 text-white" : "bg-gray-200"
            }`}
          >
            {t(status)}{" "}
            <span className="ml-2">
              {statusCounts[status as keyof typeof statusCounts]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl p-4 space-y-3 border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {t("task")} #{task.id}
              </h2>
              <span
                className={`text-sm px-2 py-1 rounded-full uppercase ${getStatusColor(
                  task.status
                )}`}
              >
                {t(task.status)}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>{t("customer")}:</strong> {task.job_card.customer_name}
              </p>
              <p>
                <strong>{t("worker")}:</strong>{" "}
                {task.worker_name || task.worker}
              </p>
              <p>
                <strong>{t("vehicle")}:</strong> {task.job_card.vehicle_model} (
                {task.job_card.vehicle_plate})
              </p>
              <p>
                <strong>{t("odometer")}:</strong>{" "}
                {task.job_card.odometer_reading?.toLocaleString() ||
                  t("not_available")}{" "}
                km
              </p>
            </div>

            {task.assigned_services.length === 0 && task.service_package && (
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="text-sm text-gray-700">
                  <strong>{t("service_package")}:</strong>{" "}
                  {task.service_package_name}
                </p>
                <select
                  value={task.package_status}
                  onChange={(e) =>
                    handleStatusChange(task.id, null, e.target.value as any)
                  }
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full uppercase ${getStatusColor(
                    task.package_status!
                  )}`}
                >
                  <option value="in_progress">{t("in_progress")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="scheduled">{t("scheduled")}</option>
                </select>
              </div>
            )}

            {task.assigned_services.map((service) => (
              <div
                key={service.id}
                className="bg-gray-50 p-3 rounded-md border"
              >
                <p className="text-sm text-gray-700">
                  <strong>{t("service")}:</strong> {service.service?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {t("cost")}: {service.service?.cost} ETB | {t("duration")}:{" "}
                  {service.service?.duration}
                </p>
                <select
                  value={service.status}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      service.service?.id || null,
                      e.target.value as any
                    )
                  }
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full uppercase ${getStatusColor(
                    service.status
                  )}`}
                >
                  <option value="in_progress">{t("in_progress")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="scheduled">{t("scheduled")}</option>
                </select>
              </div>
            ))}

            <p className="text-sm text-gray-700">
              <strong>{t("description")}:</strong> {task.task_description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;

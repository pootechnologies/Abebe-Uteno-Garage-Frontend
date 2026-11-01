import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAssignments,
  updateAssignedService,
  updateSingleAssignedService,
  updateServicePackageStatus,
} from "../api/examiner.ts";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp.ts";
import { Box } from "@mui/material";
import Select from "react-select";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ClipboardList, User, Package, FileText } from "lucide-react";

const emeraldSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#10b981' : '#a7f3d0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
    borderRadius: '0.375rem',
    minHeight: '2.5rem',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease',
    backgroundColor: state.isDisabled ? '#f3f4f6' : 'white',
    '&:hover': { borderColor: '#10b981' },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    fontSize: '0.875rem',
    '&:active': { backgroundColor: '#059669' },
  }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
  singleValue: (base: any, state: any) => ({ ...base, fontSize: '0.875rem', color: state.isDisabled ? '#6b7280' : '#1f2937' }),
  menu: (base: any) => ({ ...base, borderRadius: '0.5rem', overflow: 'hidden', zIndex: 50 }),
};

const TechnicalExaminer = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["JobCardAssignments"],
    queryFn: fetchAssignments,
  });

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    in_progress: 0,
    completed: 0,
    scheduled: 0,
  });

  useEffect(() => {
    if (data) {
      const sortedTasks = [...data].sort((a, b) => b.id - a.id);
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
      calculateStatusCounts(sortedTasks);
    }
  }, [data]);

  const calculateStatusCounts = (tasks) => {
    const counts = {
      all: tasks.length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      scheduled: tasks.filter((task) => task.status === "scheduled").length,
    };
    setStatusCounts(counts);
  };

  useEffect(() => {
    let result = [...tasks];

    if (filterStatus !== "all") {
      result = result.filter((task) => task.status === filterStatus);
    }

    if (selectedWorker !== "all") {
      result = result.filter(
        (task) => task.worker_name === selectedWorker
      );
    }

    setFilteredTasks(result);
  }, [filterStatus, selectedWorker, tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "scheduled":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      default:
        return "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "in_progress":
        return t("in_progress");
      case "completed":
        return t("completed");
      case "scheduled":
        return t("scheduled");
      default:
        return status ? status.toUpperCase() : "";
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        return task;
      })
    );

    try {
      await updateAssignedService(taskId, newStatus);
      refetch();
    } catch (err) {
      console.error("Failed to update task status:", err);
      setTasks(previousTasks);
    }
  };

  const handlePackageStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, package_status: newStatus };
        }
        return task;
      })
    );

    try {
      await updateServicePackageStatus(taskId, newStatus);
      refetch();
    } catch (err) {
      console.error("Failed to update package status:", err);
      setTasks(previousTasks);
    }
  };

  const uniqueWorkers = Array.from(
    new Set(tasks.map((task) => task.worker_name))
  );

  const workerOptions = [
    { value: "all", label: t("all_workers") || "All Workers" },
    ...uniqueWorkers.map((worker) => ({
      value: worker,
      label: worker,
    })),
  ];

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <div>
        {t("error_fetching_tasks")}: {error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("my_tasks")}
          </h2>

          <div className="w-[200px]">
            <Select
              styles={emeraldSelectStyles}
              options={workerOptions}
              value={workerOptions.find((opt) => opt.value === selectedWorker)}
              onChange={(option: any) => setSelectedWorker(option?.value || "all")}
              placeholder={t("filter_by_worker")}
              isSearchable
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-4 md:p-6 bg-muted/20 border-b border-muted">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "all", label: "all", count: statusCounts.all },
              { id: "scheduled", label: "scheduled", count: statusCounts.scheduled },
              { id: "in_progress", label: "in_progress", count: statusCounts.in_progress },
              { id: "completed", label: "completed", count: statusCounts.completed }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`flex-shrink-0 cursor-pointer px-5 py-2.5 rounded-xl font-medium whitespace-nowrap flex items-center transition-all ${
                  filterStatus === filter.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white border border-muted text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-600"
                }`}
              >
                {t(filter.label)}{" "}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === filter.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks?.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-5 border border-muted shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
          >
            {/* Top color bar depending on status */}
            <div className={`absolute top-0 left-0 w-full h-1 ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'scheduled' ? 'bg-blue-500' : 'bg-yellow-500'}`} />

            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t("task")}
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  #{task.id}
                </h2>
              </div>

              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                disabled={task.status === "completed"}
                className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase outline-none transition-colors cursor-pointer border-0 ring-1 ring-inset ${getStatusColor(task.status)}`}
              >
                <option value="in_progress">{t("in_progress")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="scheduled">{t("scheduled")}</option>
              </select>
            </div>

            <div className="space-y-4 flex-1">
              {/* Worker */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                    {t("worker")}
                  </span>
                  <span className="text-sm font-medium text-foreground">{task.worker_name}</span>
                </div>
              </div>

              {/* Service Package */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0 mt-0.5">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                    {t("service_package")}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                    <span className="text-sm font-medium text-foreground">{task.service_package_name || t("none")}</span>
                    {task.service_package && (
                      <select
                        value={task.package_status}
                        onChange={(e) => handlePackageStatusChange(task.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase outline-none transition-colors cursor-pointer border-0 ring-1 ring-inset sm:ml-auto w-max ${getStatusColor(task.package_status)}`}
                      >
                        <option value="in_progress">{t("in_progress")}</option>
                        <option value="scheduled">{t("scheduled")}</option>
                        <option value="completed">{t("completed")}</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                    {t("description")}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{task.task_description}</span>
                </div>
              </div>
            </div>

            {/* Sub Services */}
            {task.assigned_services?.length > 0 && (
              <div className="pt-5 border-t border-muted mt-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">
                  {t("services")} ({task.assigned_services.length})
                </span>
                <div className="space-y-3">
                  {task.assigned_services.map((service) => (
                    <div key={service.id} className="bg-muted/30 rounded-xl p-3 border border-muted/50 text-sm transition-colors hover:bg-muted/50">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-3">
                        <span className="font-semibold text-foreground/90">{service.service_name}</span>
                        <select
                          value={service.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const previousTasks = [...tasks];

                            setTasks((prevTasks) =>
                              prevTasks.map((t) => {
                                if (t.id === task.id) {
                                  return {
                                    ...t,
                                    assigned_services:
                                      t.assigned_services.map(
                                        (s) =>
                                          s.id === service.id
                                            ? {
                                                ...s,
                                                status: newStatus,
                                              }
                                            : s
                                      ),
                                  };
                                }
                                return t;
                              })
                            );

                            try {
                              const updatedService =
                                await updateSingleAssignedService(
                                  service.id,
                                  newStatus
                                );

                              setTasks((prevTasks) =>
                                prevTasks.map((t) => {
                                  if (t.id === task.id) {
                                    return {
                                      ...t,
                                      assigned_services:
                                        t.assigned_services.map(
                                          (s) =>
                                            s.id === service.id
                                              ? {
                                                  ...s,
                                                  status:
                                                    updatedService.status,
                                                }
                                              : s
                                        ),
                                    };
                                  }
                                  return t;
                                })
                              );
                              refetch();
                            } catch (err) {
                              console.error(
                                "Failed to update service status:",
                                err
                              );
                              setTasks(previousTasks);
                            }
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase outline-none transition-colors cursor-pointer border-0 ring-1 ring-inset shrink-0 w-max ${getStatusColor(service.status)}`}
                        >
                          <option value="in_progress">{t("in_progress")}</option>
                          <option value="scheduled">{t("scheduled")}</option>
                          <option value="completed">{t("completed")}</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("started_at")}</span>
                          <span className="font-medium text-foreground/80">{formatDateTypeStamp(service.started_at) || t("not_started")}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("completed_at")}</span>
                          <span className="font-medium text-foreground/80">{formatDateTypeStamp(service.completed_at) || t("not_completed")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalExaminer;
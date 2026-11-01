import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { t } from "i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import axiosInstance from "@/api/axios.tsx";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Trash2, 
  PlusCircle, 
  Car, 
  UserCircle, 
  CalendarCheck, 
  Gauge, 
  FileText, 
  Wrench, 
  Package,
  ClipboardList,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import ServiceAddModal from "@/features/services/components/ServiceAddModal.tsx";
import Select from "react-select";

// Define interfaces
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}
interface CustomerData {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}
interface VehicleData {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  customer: number;
}
interface ServicePackageData {
  id: number;
  name: string;
  description: string;
  cost: string;
  duration: number | null;
}
interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  cost: string;
  duration: string;
}
interface JobCardData {
  id: number;
  customer: number;
  customer_name: string;
  vehicle: number;
  vehicle_info: string;
  service_date: string;
  status: string;
  notes: string;
  odometer_reading: number | null;
  assignments: Array<{
    id: number;
    worker: number | null;
    worker_name: string;
    job_card: number;
    status: string;
    service_package: number | null;
    package_status: string;
    price: string | null;
    task_description: string;
    assigned_services: Array<{
      id: number;
      service: number | null;
      service_name: string;
      status: string;
      price: string | null;
      started_at: string | null;
      completed_at: string | null;
    }>;
  }>;
}

// Fetch functions
const fetchUserData = async (): Promise<UserData[]> => {
  const response = await axiosInstance.get("auth/user/");
  return response.data;
};
const fetchCustomerData = async (): Promise<CustomerData[]> => {
  const response = await axiosInstance.get(
    "api/garage/customers/?include_all=True"
  );
  return response?.data?.all_results;
};
const fetchVehicleData = async (): Promise<VehicleData[]> => {
  const response = await axiosInstance.get(
    "api/garage/vehicles/?include_all=True"
  );
  return response?.data?.all_results;
};
const fetchServicePackageData = async (): Promise<ServicePackageData[]> => {
  const response = await axiosInstance.get("api/garage/servicepackages/");
  return response?.data;
};

const fetchServiceData = async (): Promise<ServiceData[]> => {
  const response = await axiosInstance.get(
    "api/garage/services/?include_all=True"
  );
  return response?.data?.all_results;
};
const fetchJobCardData = async (id: string): Promise<JobCardData> => {
  const response = await axiosInstance.get(`api/garage/jobcard/${id}/`);
  return response.data;
};

// Zod Schema
const combinedJobCardSchema = z.object({
  customer: z.string().min(1, t("customer_name_required")),
  vehicle: z.string().min(1, t("selct_vehicle_name")),
  status: z.enum(["scheduled", "in_progress", "waiting_parts", "completed"]),
  notes: z.string().optional(),
  odometer_reading: z.coerce.number().optional(),
  assignments: z.array(
    z.object({
      worker: z.string().min(1, t("select_a_worker")),
      status: z.enum([
        "scheduled",
        "in_progress",
        "waiting_parts",
        "completed",
      ]),
      service_package: z.string().optional(),
      price: z.string().optional(),
      task_description: z.string().max(255).optional(),
      assigned_services: z
        .array(
          z.object({
            service: z.string().optional(),
            price: z.string().optional(),
            status: z
              .enum(["scheduled", "in_progress", "waiting_parts", "completed"])
              .optional(),
          })
        )
        .optional(),
    }).superRefine((val, ctx) => {
      const hasServicePackage = !!val.service_package;
      const hasAssignedService = val.assigned_services?.some(service => !!service.service);

      if (!hasServicePackage && !hasAssignedService) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either a service package or at least one service must be selected",
          path: ["service_package"],
        });
      }
      if (hasServicePackage && hasAssignedService) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot have both service package and assigned services",
          path: ["service_package"],
        });
      }
    })
  ),
});

type CombinedJobCardFormData = z.infer<typeof combinedJobCardSchema>;

export default function UpdateJobCard() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [priceVisibility, setPriceVisibility] = useState<Record<string, boolean>>({});

  const togglePriceVisibility = (key: string) => {
    setPriceVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isPriceVisible = (key: string): boolean => {
    return priceVisibility[key] === true;
  };

  // Data fetching
  const { data: userData } = useQuery<UserData[], Error>({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  });
  const { data: customerData } = useQuery<CustomerData[], Error>({
    queryKey: ["customerData"],
    queryFn: fetchCustomerData,
  });
  const { data: vehicleData } = useQuery<VehicleData[], Error>({
    queryKey: ["vehicleData"],
    queryFn: fetchVehicleData,
  });
  const { data: servicePackageData } = useQuery<ServicePackageData[], Error>({
    queryKey: ["servicePackageData"],
    queryFn: fetchServicePackageData,
  });
  const { data: serviceData } = useQuery<ServiceData[], Error>({
    queryKey: ["serviceData"],
    queryFn: fetchServiceData,
  });
  const { data: jobCardData } = useQuery<JobCardData, Error>({
    queryKey: ["jobCardData", id],
    queryFn: () => fetchJobCardData(id!),
    enabled: !!id,
  });

  // Form setup with useFieldArray
  const form = useForm<CombinedJobCardFormData>({
    resolver: zodResolver(combinedJobCardSchema),
    defaultValues: {
      customer: "",
      vehicle: "",
      status: "scheduled",
      notes: "",
      odometer_reading: undefined,
      assignments: [
        {
          worker: "",
          status: "scheduled",
          service_package: "",
          price: "",
          task_description: "",
          assigned_services: [{ service: "", price: "", status: "scheduled" }],
        },
      ],
    },
  });

  const {
    fields: assignmentFields,
    append: appendAssignment,
    remove: removeAssignment,
  } = useFieldArray({
    name: "assignments",
    control: form.control,
  });

  // Reset form when jobCardData loads
  useEffect(() => {
    if (jobCardData) {
      const assignments = jobCardData.assignments?.map((assignment) => ({
        worker: assignment.worker?.toString() || "",
        status: assignment.status as any || "scheduled",
        service_package: assignment.service_package?.toString() || "",
        price: assignment.price || "",
        task_description: assignment.task_description || "",
        assigned_services:
          assignment.assigned_services?.map((service) => ({
            service: service.service?.toString() || "",
            price: service.price || "",
            status: service.status as any || "",
          })) || [{ service: "", price: "", status: "scheduled" }],
      })) || [];
      
      form.reset({
        customer: jobCardData.customer?.toString() || "",
        vehicle: jobCardData.vehicle?.toString() || "",
        status: jobCardData.status as any || "scheduled",
        notes: jobCardData.notes || "",
        odometer_reading: jobCardData.odometer_reading || undefined,
        assignments,
      });
      
      // Initialize price visibility for assignments
      const newVisibility: Record<string, boolean> = {};
      assignments.forEach((_, assignmentIndex) => {
        newVisibility[`package-${assignmentIndex}`] = false;
        assignments[assignmentIndex]?.assigned_services?.forEach((_, serviceIndex) => {
          newVisibility[`service-${assignmentIndex}-${serviceIndex}`] = false;
        });
      });
      setPriceVisibility(newVisibility);
    }
  }, [jobCardData, form]);

  // Handlers for dynamic fields
  const addAssignment = () => {
    const newIndex = assignmentFields.length;
    appendAssignment({
      worker: "",
      status: "scheduled",
      service_package: "",
      price: "",
      task_description: "",
      assigned_services: [{ service: "", price: "", status: "scheduled" }],
    });
    setPriceVisibility((prev) => ({
      ...prev,
      [`package-${newIndex}`]: false,
      [`service-${newIndex}-0`]: false,
    }));
  };

  const removeAssignmentHandler = (index: number) => {
    if (assignmentFields.length > 1) {
      removeAssignment(index);
      // Clean up price visibility state for removed assignment
      const newPriceVisibility = { ...priceVisibility };
      Object.keys(newPriceVisibility).forEach((key) => {
        if (key.startsWith(`package-${index}-`) || key.startsWith(`service-${index}-`)) {
          delete newPriceVisibility[key];
        }
      });
      setPriceVisibility(newPriceVisibility);
    } else {
      toast.error(t("at_least_one_assignment_required") || "At least one assignment required");
    }
  };

  const addEmptyService = (assignmentIndex: number) => {
    const currentServices = form.getValues(
      `assignments.${assignmentIndex}.assigned_services`
    ) || [];
    const newServiceIndex = currentServices.length;
    form.setValue(`assignments.${assignmentIndex}.assigned_services`, [
      ...currentServices,
      { service: "", price: "", status: "scheduled" },
    ]);
    setPriceVisibility((prev) => ({
      ...prev,
      [`service-${assignmentIndex}-${newServiceIndex}`]: false,
    }));
  };

  const removeService = (assignmentIndex: number, serviceIndex: number) => {
    const currentServices = form.getValues(
      `assignments.${assignmentIndex}.assigned_services`
    ) || [];
    if (currentServices.length > 1) {
      const updatedServices = currentServices.filter(
        (_, i) => i !== serviceIndex
      );
      form.setValue(
        `assignments.${assignmentIndex}.assigned_services`,
        updatedServices
      );
      // Clean up price visibility state for removed service
      const newPriceVisibility = { ...priceVisibility };
      delete newPriceVisibility[`service-${assignmentIndex}-${serviceIndex}`];
      // Re-index remaining services
      updatedServices.forEach((_, newIndex) => {
        if (priceVisibility[`service-${assignmentIndex}-${newIndex}`] === undefined) {
          newPriceVisibility[`service-${assignmentIndex}-${newIndex}`] = false;
        }
      });
      setPriceVisibility(newPriceVisibility);
    } else {
      toast.error(t("at_least_one_service_required") || "At least one service required");
    }
  };

  const handleAddService = (assignmentIndex: number, serviceId: string) => {
    const currentServices = form.watch(
      `assignments.${assignmentIndex}.assigned_services`
    ) || [];
    const serviceExists = currentServices.some((s) => s.service === serviceId);
    if (!serviceExists) {
      const newServiceIndex = currentServices.length;
      form.setValue(`assignments.${assignmentIndex}.assigned_services`, [
        ...currentServices,
        { service: serviceId, price: "", status: "scheduled" },
      ]);
      // Clear service_package if a service is added
      form.setValue(`assignments.${assignmentIndex}.service_package`, "");
      setPriceVisibility((prev) => ({
        ...prev,
        [`service-${assignmentIndex}-${newServiceIndex}`]: false,
      }));
      toast.success(t("service_added_successfully") || "Service added");
    } else {
      toast.error(t("service_already_added") || "Service already added");
    }
  };

  // Submit handler
  const onSubmit = async (values: CombinedJobCardFormData) => {
    // Check for assignment errors before submission
    const assignments = values.assignments;
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      const hasServicePackage = !!assignment.service_package;
      const hasAssignedService = assignment.assigned_services?.some(service => !!service.service);
      if (!hasServicePackage && !hasAssignedService) {
        toast.error(`Assignment ${i + 1}: Either a service package or at least one service must be selected`);
        return; // Stop submission
      }
      if (hasServicePackage && hasAssignedService) {
        toast.error(`Assignment ${i + 1}: Cannot have both service package and assigned services`);
        return; // Stop submission
      }
    }

    try {
      const transformedData = {
        customer: parseInt(values.customer),
        vehicle: parseInt(values.vehicle),
        status: values.status,
        notes: values.notes,
        odometer_reading: values.odometer_reading,
        assignments: values.assignments.map((assignment) => ({
          worker: parseInt(assignment.worker),
          status: assignment.status,
          service_package: assignment.service_package
            ? parseInt(assignment.service_package)
            : null,
          price: assignment.price || null,
          task_description: assignment.task_description,
          assigned_services: assignment.service_package
            ? []
            : assignment.assigned_services?.map((service) => ({
                service: service.service ? parseInt(service.service) : null,
                price: service.price || null,
                status: service.status,
              })) || [],
        })),
      };
      await axiosInstance.patch(`api/garage/jobcard/${id}/`, transformedData);
      toast.success(t("job_card_details") + " " + t("updated_successfully"));
      navigate("/manage-job-card");
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to update Job Card.") || "Failed to update");
    }
  };

  // Loading state
  if (
    !userData ||
    !customerData ||
    !vehicleData ||
    !servicePackageData ||
    !serviceData ||
    !jobCardData
  ) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse font-medium">{t("Loading...") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => navigate("/manage-job-card")}
                      className="cursor-pointer hover:text-emerald-600 transition-colors"
                    >
                      {t("job_card")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-gray-900">
                      {t("update_job_card")}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="mt-2 flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 text-white rounded-lg shadow-md shadow-emerald-200">
                  <Wrench className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("update_job_card")}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="rounded-xl border-gray-200 font-semibold shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back") || "Back"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">{t("customer_information") || "General Information"}</h2>
                </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" />{t("customer")}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-sm font-medium"
                          disabled
                        >
                          <option value="">{t("select_customer_name")}</option>
                          {customerData.map((customer) => (
                            <option
                              key={customer.id}
                              value={customer.id.toString()}
                            >
                              {customer.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Car className="w-3.5 h-3.5" />{t("vehicle")}</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-sm font-medium"
                          disabled
                        >
                          <option value="">{t("select_vehicle_name")}</option>
                          {vehicleData.map((vehicle) => (
                            <option
                              key={vehicle.id}
                              value={vehicle.id.toString()}
                            >
                              {vehicle.license_plate} - {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5" />{t("job_card_status")}</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all">
                          <option value="scheduled">{t("scheduled")}</option>
                          <option value="in_progress">{t("in_progress")}</option>
                          <option value="waiting_parts">
                            {t("waiting_for_parts")}
                          </option>
                          <option value="completed">{t("completed")}</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odometer_reading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" />{t("mileage")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                          placeholder={t("mileage") || "0"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                       <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{t("notes")}</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                          placeholder={t("notes") || "Enter notes here..."}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assignments Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-emerald-600"/>{t("assignments")}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssignment}
                  className="gap-2 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t("add_assignment")}
                </Button>
              </div>

              <div className="space-y-6">
                 {assignmentFields.map((item, assignmentIndex) => {
                  const servicePackageValue = form.watch(
                    `assignments.${assignmentIndex}.service_package`
                  );
                  const hasServicePackage = !!servicePackageValue;
                  const assignedServices = form.watch(
                    `assignments.${assignmentIndex}.assigned_services`
                  ) || [];
                  const hasAssignedService = assignedServices.some(
                    (service) => !!service.service
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white border p-6 md:p-8 rounded-2xl space-y-6 relative shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center border-4 border-gray-50 shadow-sm z-10 text-xs">
                        {assignmentIndex + 1}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                        onClick={() => removeAssignmentHandler(assignmentIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
                        {/* Worker */}
                        <FormField
                          control={form.control}
                          name={`assignments.${assignmentIndex}.worker`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider">{t("worker")}</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                >
                                  <option value="">{t("select_a_worker")}</option>
                                  {userData.map((user) => (
                                    <option
                                      key={user.id}
                                      value={user.id.toString()}
                                    >
                                      {user.name}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                            </FormItem>
                          )}
                        />

                        {/* Status */}
                        <FormField
                          control={form.control}
                          name={`assignments.${assignmentIndex}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider">{t("assignment_status")}</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                >
                                  <option value="scheduled">
                                    {t("scheduled")}
                                  </option>
                                  <option value="in_progress">
                                    {t("in_progress")}
                                  </option>
                                  <option value="waiting_parts">
                                    {t("waiting_for_parts")}
                                  </option>
                                  <option value="completed">
                                    {t("completed")}
                                  </option>
                                </select>
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                            </FormItem>
                          )}
                        />

                        {/* Service Package */}
                        {!hasAssignedService && (
                          <FormField
                            control={form.control}
                            name={`assignments.${assignmentIndex}.service_package`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5 text-emerald-600"><Package className="w-3.5 h-3.5" />{t("service_package")}</FormLabel>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => togglePriceVisibility(`package-${assignmentIndex}`)}
                                  >
                                    {isPriceVisible(`package-${assignmentIndex}`) ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                <FormControl>
                                  <select
                                    {...field}
                                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all shadow-emerald-100 shadow-sm"
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      if (e.target.value) {
                                        form.setValue(
                                          `assignments.${assignmentIndex}.assigned_services`,
                                          [{ service: "", price: "", status: "scheduled" }]
                                        );
                                        // Set the price from the selected service package
                                        const selectedPackage = servicePackageData.find(
                                          (sp) => sp.id.toString() === e.target.value
                                        );
                                        form.setValue(
                                          `assignments.${assignmentIndex}.price`,
                                          selectedPackage?.cost || ""
                                        );
                                      } else {
                                        form.setValue(
                                          `assignments.${assignmentIndex}.price`,
                                          ""
                                        );
                                      }
                                    }}
                                  >
                                    <option value="">
                                      {t("select_service_package")}
                                    </option>
                                    {servicePackageData.map((pkg) => (
                                      <option
                                        key={pkg.id}
                                        value={pkg.id.toString()}
                                      >
                                        {pkg.name}
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {/* Price for Service Package */}
                        {!hasAssignedService && servicePackageValue && isPriceVisible(`package-${assignmentIndex}`) && (
                          <FormField
                            control={form.control}
                            name={`assignments.${assignmentIndex}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider">{t("price")}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                    placeholder={t("price")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Task Description */}
                        <FormField
                          control={form.control}
                          name={`assignments.${assignmentIndex}.task_description`}
                          render={({ field }) => (
                            <FormItem>
                               <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider">{t("task_description")}</FormLabel>
                              <FormControl>
                                <Input
                                  className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                  placeholder={t("task_description") || "Describe the task..."}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase font-bold text-rose-500" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Assigned Services List */}
                      {!hasServicePackage && (
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-gray-700">
                              {t("assigned_services")}
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addEmptyService(assignmentIndex)}
                                className="gap-1 rounded-lg text-xs"
                              >
                                <PlusCircle className="h-3 w-3" />
                                {t("add_more")}
                              </Button>
                              <ServiceAddModal
                                triggerButton={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 rounded-lg text-xs"
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                    {t("add_assigned_service")}
                                  </Button>
                                }
                                onServiceSelect={(serviceId) =>
                                  handleAddService(assignmentIndex, serviceId)
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            {assignedServices.map((_, serviceIndex) => {
                              return (
                                <div
                                  key={serviceIndex}
                                  className="grid grid-cols-1 gap-4 md:grid-cols-2 relative bg-white p-4 rounded-lg shadow-sm border border-gray-100 group/service"
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-300 hover:text-rose-600"
                                    onClick={() =>
                                      removeService(assignmentIndex, serviceIndex)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <FormField
                                    control={form.control}
                                    name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`}
                                    render={({ field }) => {
                                      const serviceId = form.watch(
                                        `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`
                                      );
                                      return (
                                        <FormItem>
                                          <div className="flex items-center justify-between">
                                            <FormLabel className="text-[10px] font-bold uppercase text-gray-400">
                                              {t("service")} {serviceIndex + 1}
                                            </FormLabel>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => togglePriceVisibility(`service-${assignmentIndex}-${serviceIndex}`)}
                                            >
                                              {isPriceVisible(`service-${assignmentIndex}-${serviceIndex}`) ? (
                                                <EyeOff className="h-3 w-3" />
                                              ) : (
                                                <Eye className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                          <FormControl>
                                            <select
                                              {...field}
                                              className="w-full py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
                                              onChange={(e) => {
                                                field.onChange(e.target.value);
                                                if (e.target.value) {
                                                  form.setValue(
                                                    `assignments.${assignmentIndex}.service_package`,
                                                    ""
                                                  );
                                                  // Set the price from the selected service
                                                  const selectedService = serviceData.find(
                                                    (s) => s.id.toString() === e.target.value
                                                  );
                                                  form.setValue(
                                                    `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`,
                                                    selectedService?.cost || ""
                                                  );
                                                } else {
                                                  form.setValue(
                                                    `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`,
                                                    ""
                                                  );
                                                }
                                              }}
                                            >
                                              <option value="">
                                                {t("select_service")}
                                              </option>
                                              {serviceData.map((service) => (
                                                <option
                                                  key={service.id}
                                                  value={service.id.toString()}
                                                >
                                                  {service.name}
                                                </option>
                                              ))}
                                            </select>
                                          </FormControl>
                                          <FormMessage className="text-[10px] text-rose-500 font-bold" />
                                        </FormItem>
                                      );
                                    }}
                                  />
                                  {form.watch(`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`) && isPriceVisible(`service-${assignmentIndex}-${serviceIndex}`) && (
                                    <FormField
                                      control={form.control}
                                      name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-gray-400">
                                            {t("price")}
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="text"
                                              className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                              placeholder={t("price")}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage className="text-[10px] text-rose-500 font-bold" />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  <FormField
                                    control={form.control}
                                    name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.status`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase text-gray-400">
                                          {t("service_status")}
                                        </FormLabel>
                                        <FormControl>
                                          <select
                                            {...field}
                                            className="w-full py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
                                          >
                                            <option value="">
                                              {t("select_status")}
                                            </option>
                                            <option value="scheduled">
                                              {t("scheduled")}
                                            </option>
                                            <option value="in_progress">
                                              {t("in_progress")}
                                            </option>
                                            <option value="waiting_parts">
                                              {t("waiting_for_parts")}
                                            </option>
                                            <option value="completed">
                                              {t("completed")}
                                            </option>
                                          </select>
                                        </FormControl>
                                        <FormMessage className="text-[10px] text-rose-500 font-bold" />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-6 pb-12">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 py-6 text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting ? t("updating") || "Updating..." : <>{t("update")} {t("job_card")}</>}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

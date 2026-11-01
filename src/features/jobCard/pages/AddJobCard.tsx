import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { toast } from "react-hot-toast";
import {
  fetchUserData,
  fetchCustomerData,
  fetchVehicleData,
  fetchServicePackageData,
  fetchServiceData,
  submitCombinedJobCard,
} from "../api/jobCard.ts";
import ServiceAddModal from "@/features/services/components/ServiceAddModal.tsx";
import { Trash2, PlusCircle, Briefcase, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

// Define the Zod schema
const combinedJobCardSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  vehicle: z.string().min(1, "Vehicle is required"),
  status: z.enum(["scheduled", "in_progress", "waiting_parts", "completed"]),
  notes: z.string().optional(),
  odometer_reading: z.coerce.number().optional(),
  assignments: z.array(
    z.object({
      worker: z.string().min(1, "Worker is required"),
      status: z.enum([
        "scheduled",
        "in_progress",
        "waiting_parts",
        "completed",
      ]),
      service_package: z.string().optional(),
      price: z.string().optional(),
      task_description: z.string().max(255).optional(),
      assigned_services: z.array(
        z.object({
          service: z.string().optional(),
          price: z.string().optional(),
          status: z.enum([
            "scheduled",
            "in_progress",
            "waiting_parts",
            "completed",
          ]),
        })
      ),
    }).superRefine((val, ctx) => {
      const hasServicePackage = !!val.service_package;
      const hasAssignedService = val.assigned_services.some(service => !!service.service);

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
    }),
  ),
});

type CombinedJobCardFormData = z.infer<typeof combinedJobCardSchema>;

export default function CombinedComponent() {
  const { t } = useTranslation();
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Fetch data using react-query
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
  });
  const { data: customerData } = useQuery({
    queryKey: ["customerData"],
    queryFn: fetchCustomerData,
  });
  const { data: vehicleData } = useQuery({
    queryKey: ["vehicleData"],
    queryFn: fetchVehicleData,
  });
  const { data: servicePackageData } = useQuery({
    queryKey: ["servicePackageData"],
    queryFn: fetchServicePackageData,
  });
  const { data: serviceData } = useQuery({
    queryKey: ["serviceData"],
    queryFn: fetchServiceData,
    refetchInterval: 5000, // 5 seconds
  });

  // Initialize the form with useFieldArray for dynamic assignments
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

  const customerValue = form.watch("customer");

 useEffect(() => {
  if (customerValue && vehicleData && customerData) {
    // Find the customer ID from the selected organization
    const selectedCustomer = customerData.find(
      (c) => (c.organization || c.name) === customerValue
    );
    const customerId = selectedCustomer?.id?.toString();
    
    const filtered = vehicleData.filter(
      (vehicle) => vehicle.customer && vehicle.customer.toString() === customerId
    );
    setFilteredVehicles(filtered);
    // Reset vehicle selection if current vehicle doesn't belong to the new customer
    const currentVehicle = form.getValues("vehicle");
    if (
      currentVehicle &&
      !filtered.some((v) => v.id.toString() === currentVehicle)
    ) {
      form.setValue("vehicle", "");
    }
  } else {
    setFilteredVehicles(vehicleData || []);
  }
}, [customerValue, vehicleData, customerData, form]);

  // Initialize price visibility for default assignments
  useEffect(() => {
    const assignments = form.getValues("assignments");
    if (assignments && assignments.length > 0) {
      const newVisibility: Record<string, boolean> = {};
      assignments.forEach((_, assignmentIndex) => {
        newVisibility[`package-${assignmentIndex}`] = false;
        const services = form.getValues(`assignments.${assignmentIndex}.assigned_services`);
        services.forEach((_, serviceIndex) => {
          newVisibility[`service-${assignmentIndex}-${serviceIndex}`] = false;
        });
      });
      setPriceVisibility((prev) => ({ ...prev, ...newVisibility }));
    }
  }, [form]);


  const onSubmit = async (values: CombinedJobCardFormData) => {
    // Check for assignment errors before submission
    const assignments = values.assignments;
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      const hasServicePackage = !!assignment.service_package;
      const hasAssignedService = assignment.assigned_services.some(service => !!service.service);
      if (!hasServicePackage && !hasAssignedService) {
        toast.error(`Assignment ${i + 1}: Either a service package or at least one service must be selected`);
        return; // Stop submission
      }
      if (hasServicePackage && hasAssignedService) {
        toast.error(`Assignment ${i + 1}: Cannot have both service package and assigned services`);
        return; // Stop submission
      }
    }

    setIsSubmitting(true);
    try {
      // Find the customer ID from the selected organization
      const selectedCustomer = customerData?.find(
        (c) => (c.organization || c.name) === values.customer
      );
      
      const transformedData = {
        customer: selectedCustomer?.id || parseInt(values.customer),
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
            : assignment.assigned_services.map((service) => ({
                service: service.service ? parseInt(service.service) : null,
                price: service.price || null,
                status: service.status,
              })),
        })),
      };
      await submitCombinedJobCard(transformedData);
      toast.success("Combined Job Card submitted successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit Combined Job Card.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      toast.error(t("at_least_one_assignment_required"));
    }
  };

  const addEmptyService = (assignmentIndex: number) => {
    const currentServices = form.getValues(
      `assignments.${assignmentIndex}.assigned_services`
    );
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
    );
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
          newPriceVisibility[`service-${assignmentIndex}-${newIndex}`] = true;
        }
      });
      setPriceVisibility(newPriceVisibility);
    } else {
      toast.error(t("at_least_one_service_required"));
    }
  };

  const handleAddService = (assignmentIndex: number, serviceId: string) => {
    const currentServices = form.getValues(
      `assignments.${assignmentIndex}.assigned_services`
    );
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
      toast.success(t("service_added_successfully"));
    } else {
      toast.error(t("service_already_added"));
    }
  };

  if (
    !userData ||
    !customerData ||
    !vehicleData ||
    !servicePackageData ||
    !serviceData
  ) {
    return <div>{t("loading")}...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-[1000px] mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            {t("add_job_card")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-6"
            >
              {/* Customer, Vehicle, Status, Odometer, Notes */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-600">{t("customer")}</FormLabel>
                      <Select
                        className="w-full"
                        classNamePrefix="react-select"
                        options={customerData.map((customer) => ({
                          value: customer.organization || customer.name,
                          label: customer.organization || customer.name,
                        }))}
                        value={
                          field.value
                            ? {
                                value: field.value,
                                label: field.value,
                              }
                            : null
                        }
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption?.value)
                        }
                        placeholder={t("select_customer_name")}
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("vehicle")}</FormLabel>
                      <Select
                        className="w-full"
                        classNamePrefix="react-select"
                        options={filteredVehicles.map((vehicle) => ({
                          value: vehicle.id.toString(),
                          label: `${vehicle.model ?? ""}${vehicle.model && vehicle.license_plate ? " - " : ""}${vehicle.license_plate ?? ""}`.trim(),
                        }))}
                        value={
                          field.value
                            ? (() => {
                                const selected = filteredVehicles.find(
                                  (v) => v.id.toString() === field.value
                                );
                                return selected
                                  ? {
                                      value: field.value,
                                      label: `${selected.model ?? ""}${selected.model && selected.license_plate ? " - " : ""}${selected.license_plate ?? ""}`.trim(),
                                    }
                                  : null;
                              })()
                            : null
                        }
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption?.value)
                        }
                        placeholder={t("select_a_model")}
                        isClearable
                        isDisabled={!customerValue}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("job_card_status")}</FormLabel>
                      <Select
                        className="w-full"
                        classNamePrefix="react-select"
                        options={[
                          { value: "scheduled", label: t("scheduled") },
                          { value: "in_progress", label: t("in_progress") },
                          {
                            value: "waiting_parts",
                            label: t("waiting_for_parts"),
                          },
                          { value: "completed", label: t("completed") },
                        ]}
                        value={{ value: field.value, label: t(field.value) }}
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption?.value)
                        }
                        placeholder={t("select_status")}
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odometer_reading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mileage")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          className="w-full p-5"
                          placeholder={t("odometer_reading")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("notes")}</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full p-5"
                          placeholder={t("notes")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Assignments Header with Add Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("assignments")}</h2>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAssignment}
                    className="gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t("add_assignment")}
                  </Button>
                </div>
              </div>
              {/* Assignments List */}
              <div className="space-y-4">
                {assignmentFields.map((_, assignmentIndex) => {
                  const servicePackageValue = form.watch(
                    `assignments.${assignmentIndex}.service_package`
                  );
                  const hasServicePackage = !!servicePackageValue;
                  const assignedServices = form.watch(
                    `assignments.${assignmentIndex}.assigned_services`
                  );
                  const hasAssignedService = assignedServices.some(
                    (service) => !!service.service
                  );
                  return (
                    <div
                      key={assignmentIndex}
                      className="border p-4 rounded-lg space-y-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeAssignmentHandler(assignmentIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <h3 className="font-semibold">
                        {t("assignment")} {assignmentIndex + 1}
                      </h3>
                      {/* Worker, Status, Service Package, Task Description */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Worker */}
                        <FormField
                          control={form.control}
                          name={`assignments.${assignmentIndex}.worker`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("worker")}</FormLabel>
                              <Select
                                className="w-full"
                                classNamePrefix="react-select"
                                options={userData.map((user) => ({
                                  value: user.id.toString(),
                                  label: user.name,
                                }))}
                                value={
                                  field.value
                                    ? {
                                        value: field.value,
                                        label:
                                          userData.find(
                                            (u) => u.id.toString() === field.value
                                          )?.name || "",
                                      }
                                    : null
                                }
                                onChange={(selectedOption) =>
                                  field.onChange(selectedOption?.value)
                                }
                                placeholder={t("select_a_worker")}
                                isClearable
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Status */}
                        <FormField
                          control={form.control}
                          name={`assignments.${assignmentIndex}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("assignment_status")}</FormLabel>
                              <Select
                                className="w-full"
                                classNamePrefix="react-select"
                                options={[
                                  { value: "scheduled", label: t("scheduled") },
                                  {
                                    value: "in_progress",
                                    label: t("in_progress"),
                                  },
                                  {
                                    value: "waiting_parts",
                                    label: t("waiting_for_parts"),
                                  },
                                  { value: "completed", label: t("completed") },
                                ]}
                                value={{
                                  value: field.value,
                                  label: t(field.value),
                                }}
                                onChange={(selectedOption) =>
                                  field.onChange(selectedOption?.value)
                                }
                                placeholder={t("select_assignment_status")}
                                isClearable
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Service Package (only show if no assigned service selected) */}
                        {!hasAssignedService && (
                          <FormField
                            control={form.control}
                            name={`assignments.${assignmentIndex}.service_package`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>{t("service_package")}</FormLabel>
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
                                <Select
                                  className="w-full"
                                  classNamePrefix="react-select"
                                  options={[
                                    {
                                      value: "clear",
                                      label: t("clear_selection"),
                                    },
                                    ...servicePackageData.map((sp) => ({
                                      value: sp.id.toString(),
                                      label: sp.name,
                                    })),
                                  ]}
                                  value={
                                    field.value
                                      ? {
                                          value: field.value,
                                          label:
                                            servicePackageData.find(
                                              (sp) =>
                                                sp.id.toString() === field.value
                                            )?.name || "",
                                        }
                                      : null
                                  }
                                  onChange={(selectedOption) => {
                                    if (selectedOption?.value === "clear") {
                                      field.onChange("");
                                      form.setValue(
                                        `assignments.${assignmentIndex}.price`,
                                        ""
                                      );
                                    } else {
                                      field.onChange(selectedOption?.value);
                                      if (selectedOption?.value) {
                                        form.setValue(
                                          `assignments.${assignmentIndex}.assigned_services`,
                                          [{ service: "", status: "scheduled" }]
                                        );
                                        // Set the price from the selected service package
                                        const selectedPackage = servicePackageData.find(
                                          (sp) => sp.id.toString() === selectedOption?.value
                                        );
                                        form.setValue(
                                          `assignments.${assignmentIndex}.price`,
                                          selectedPackage?.cost || ""
                                        );
                                      }
                                    }
                                  }}
                                  placeholder={t("select_service_package")}
                                  isClearable
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        {/* Price (only show if service package is selected) */}
                        {!hasAssignedService && servicePackageValue && isPriceVisible(`package-${assignmentIndex}`) && (
                          <FormField
                            control={form.control}
                            name={`assignments.${assignmentIndex}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("price")}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    className="w-full p-5"
                                    placeholder={t("price")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
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
                              <FormLabel>{t("task_description")}</FormLabel>
                              <FormControl>
                                <Input
                                  className="w-full p-5"
                                  placeholder={t("task_description")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Assigned Services (only show if no service package selected) */}
                      {!hasServicePackage && (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">
                              {t("assigned_services")}
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addEmptyService(assignmentIndex)}
                                className="gap-1"
                              >
                                <PlusCircle className="h-4 w-4" />
                                {t("add_more")}
                              </Button>
                              <ServiceAddModal
                                triggerButton={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <PlusCircle className="h-4 w-4" />
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
                              const serviceId = form.watch(
                                `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`
                              );
                              return (
                                <div
                                  key={serviceIndex}
                                  className="grid grid-cols-1 gap-4 md:grid-cols-2 relative"
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute -top-2 right-0 h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      removeService(assignmentIndex, serviceIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <FormField
                                    control={form.control}
                                    name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <div className="flex items-center justify-between">
                                          <FormLabel>
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
                                        <Select
                                          className="w-full"
                                          classNamePrefix="react-select"
                                          menuPortalTarget={document.body}
                                          styles={{
                                            menuPortal: (base) => ({
                                              ...base,
                                              zIndex: 9999,
                                            }),
                                          }}
                                          options={[
                                            {
                                              value: "clear",
                                              label: t("clear_selection"),
                                            },
                                            ...serviceData?.map((service) => ({
                                              value: service.id.toString(),
                                              label: service.name,
                                            })),
                                          ]}
                                          value={
                                            field.value
                                              ? {
                                                  value: field.value,
                                                  label:
                                                    serviceData?.find(
                                                      (s) =>
                                                        s.id.toString() ===
                                                        field.value
                                                    )?.name || "",
                                                }
                                              : null
                                          }
                                          onChange={(selectedOption) => {
                                            if (
                                              selectedOption?.value === "clear"
                                            ) {
                                              field.onChange("");
                                              form.setValue(
                                                `assignments.${assignmentIndex}.service_package`,
                                                ""
                                              );
                                              form.setValue(
                                                `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`,
                                                ""
                                              );
                                            } else {
                                              field.onChange(
                                                selectedOption?.value
                                              );
                                              if (selectedOption?.value) {
                                                form.setValue(
                                                  `assignments.${assignmentIndex}.service_package`,
                                                  ""
                                                );
                                                // Set the price from the selected service
                                                const selectedService = serviceData?.find(
                                                  (s) => s.id.toString() === selectedOption?.value
                                                );
                                                form.setValue(
                                                  `assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`,
                                                  selectedService?.cost || ""
                                                );
                                              }
                                            }
                                          }}
                                          placeholder={t("select_service")}
                                          isClearable
                                        />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  {form.watch(`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.service`) && isPriceVisible(`service-${assignmentIndex}-${serviceIndex}`) && (
                                    <FormField
                                      control={form.control}
                                      name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.price`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>{t("price")}</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="text"
                                              className="w-full p-5"
                                              placeholder={t("price")}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  <FormField
                                    control={form.control}
                                    name={`assignments.${assignmentIndex}.assigned_services.${serviceIndex}.status`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          {t("service_status")}
                                        </FormLabel>
                                        <Select
                                          className="w-full"
                                          classNamePrefix="react-select"
                                          menuPortalTarget={document.body}
                                          styles={{
                                            menuPortal: (base) => ({
                                              ...base,
                                              zIndex: 9999,
                                            }),
                                          }}
                                          options={[
                                            {
                                              value: "scheduled",
                                              label: t("scheduled"),
                                            },
                                            {
                                              value: "in_progress",
                                              label: t("in_progress"),
                                            },
                                            {
                                              value: "waiting_parts",
                                              label: t("waiting_for_parts"),
                                            },
                                            {
                                              value: "completed",
                                              label: t("completed"),
                                            },
                                          ]}
                                          value={{
                                            value: field.value,
                                            label: t(field.value),
                                          }}
                                          onChange={(selectedOption) =>
                                            field.onChange(selectedOption?.value)
                                          }
                                          placeholder={t("select_service_status")}
                                          isClearable
                                        />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

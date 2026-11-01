"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-hot-toast";
import { Trash2, ClipboardList, Plus, ChevronLeft, ArrowLeft, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { t } from "i18next";
import axiosInstance from "@/api/axios";
import Select from "react-select";

// Define interfaces for your data structures
interface Customer {
  id: number;
  name: string;
  tin_number?: string;
  phone?: string;
}
interface Vehicle {
  id: number;
  model: string;
  shanci_kutir?: string;
  motor_kutir?: string;
  license_plate?: string;
  customer?: number;
}
interface User {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
  part_number?: string;
}
interface JobCard {
  id: number;
  customer_name: string;
}
interface PartRequest {
  id: number;
  job_card: number;
  customer: number;
  vehicle: number;
  vehicle_shanci_kutir?: string;
  vehicle_motor_kutir?: string;
  vehicle_targa_kutir?: string;
  customer_phone?: string;
  customer_tin_number?: string;
  asrekabi_sim?: string | number;
  terekabi_sim?: string | number;
  ken?: string;
  items?: Array<{
    id: number;
    product: number;
    product_name: string;
    quantity: number;
  }>;
}

// Define the Zod schema
const itemSchema = z.object({
  product: z.union([z.string(), z.number()]).optional(),
  quantity: z.number().min(1, t("quantity_must_greater_zero")).optional(),
});
const vehicleInformationSchema = z.object({
  job_card: z.number(),
  model: z.union([z.string(), z.number()]).optional(),
  ye_bale_nibret_sim: z.union([z.string(), z.number()]).optional(),
  shanci_kutir: z.string().max(100).optional(),
  motor_kutir: z.string().max(100).optional(),
  targa_kutir: z.string().max(100).optional(),
  silk_kutir: z.string().max(100).optional(),
  tin_kutir: z.string().max(100).optional(),
  ken: z.string().optional(),
  asrekabi_sim: z.union([z.string(), z.number()]).optional(),
  terekabi_sim: z.union([z.string(), z.number()]).optional(),
  items: z.array(itemSchema).optional(),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

// Custom styles for react-select — emerald theme
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#10b981" : "var(--border)",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.15)" : "none",
    backgroundColor: "transparent",
    "&:hover": { borderColor: "#10b981" },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#10b981"
      : state.isFocused
        ? "#d1fae5"
        : "transparent",
    color: state.isSelected ? "#fff" : "#374151",
  }),
};

const UpdatePartRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: partRequest,
    isLoading,
    isError,
    error,
  } = useQuery<PartRequest>({
    queryKey: ["partRequest", id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/garage/partrequest/${id}/`
      );
      return response.data;
    },
  });

  if (error) {
    console.error("Error fetching part request details:", error);
  }

  const form = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      job_card: 0,
      model: "",
      ye_bale_nibret_sim: "",
      shanci_kutir: "",
      motor_kutir: "",
      targa_kutir: "",
      silk_kutir: "",
      tin_kutir: "",
      ken: "",
      asrekabi_sim: "",
      terekabi_sim: "",
      items: [{ product: 0, quantity: 1 }],
    },
  });

  const { reset, watch } = form;
  const selectedCustomerId = watch("ye_bale_nibret_sim");
  const items = watch("items") || [];

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/customers/");
        setCustomers(response?.data?.results || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error(t("Failed to fetch customers."));
      }
    };
    fetchCustomers();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/vehicles/");
        setVehicles(response?.data?.results || []);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error(t("Failed to fetch vehicles."));
      }
    };
    fetchVehicles();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/auth/user/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(t("Failed to fetch users."));
      }
    };
    fetchUsers();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/products/?include_all=True");
        setProducts(response?.data?.all_results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(t("Failed to fetch products."));
      }
    };
    fetchProducts();
  }, []);

  // Fetch job cards
  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/garage/jobcard?include_all=True"
        );
        setJobCards(response.data.results);
      } catch (error) {
        console.error("Error fetching job cards:", error);
        toast.error(t("Failed to fetch job cards."));
      }
    };
    fetchJobCards();
  }, []);

  // Filter vehicles by selected customer
  useEffect(() => {
    if (selectedCustomerId) {
      const filtered = vehicles.filter(
        (vehicle) => vehicle.customer === Number(selectedCustomerId)
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [selectedCustomerId, vehicles]);

  // Reset form with fetched data
  useEffect(() => {
    if (partRequest) {
      const mapped = {
        job_card: partRequest.job_card || 0,
        ye_bale_nibret_sim: partRequest.customer || "",
        model: partRequest.vehicle || "",
        shanci_kutir: partRequest.vehicle_shanci_kutir || "",
        motor_kutir: partRequest.vehicle_motor_kutir || "",
        targa_kutir: partRequest.vehicle_targa_kutir || "",
        silk_kutir: partRequest.customer_phone || "",
        tin_kutir: partRequest.customer_tin_number || "",
        ken: partRequest.ken
          ? new Date(partRequest.ken).toISOString().split("T")[0]
          : "",
        asrekabi_sim: partRequest.asrekabi_sim || "",
        terekabi_sim: partRequest.terekabi_sim || "",
        items: partRequest.items?.map((item) => ({
          product: item.product || 0,
          quantity: item.quantity || 1,
        })) || [{ product: 0, quantity: 1 }],
      };
      reset(mapped);
    }
  }, [partRequest, reset]);

  const handleSubmit = async (values: VehicleInformationFormData) => {
    setIsSubmitting(true);
    try {
      const filteredItems = values.items?.filter(
        (item) => item.product && item.quantity && item.quantity > 0
      );
      const payload = {
        ...values,
        customer: Number(values.ye_bale_nibret_sim) || 0,
        vehicle: Number(values.model) || 0,
        items: filteredItems,
      };
      delete payload.ye_bale_nibret_sim;
      delete payload.model;
      await axiosInstance.patch(`/api/garage/partrequest/${id}/`, payload);
      toast.success(t("Part request updated successfully!"));
      navigate("/manage-vehicle-part-request");
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to update part request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    const currentItems = form.getValues("items") || [];
    form.setValue("items", [...currentItems, { product: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = [...(form.getValues("items") || [])];
    currentItems.splice(index, 1);
    form.setValue("items", currentItems);
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-muted shadow-sm overflow-hidden animate-pulse">
          <div className="h-24 bg-emerald-50" />
          <div className="p-8 grid grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-11 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <ClipboardList className="h-6 w-6 text-red-400" />
          </div>
          <p className="font-semibold text-red-600">
            {t("Error loading part request details.")}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/manage-vehicle-part-request")}
          >
            {t("Go back")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Reusable select styles ─────────────────────────────────────────────────
  const fieldClass =
    "h-11 rounded-xl bg-muted/50 border-muted focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium";
  const labelClass = "text-sm font-bold text-foreground/70";

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Top Sticky Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("update_part_request")} <span className="text-emerald-600">#{id}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
          {/* Form */}
          <div className="p-6 md:p-8 space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

                {/* ── Vehicle & Customer Info ─────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    {t("vehicle_information")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Job Card — disabled */}
                    <FormField
                      control={form.control}
                      name="job_card"
                      render={() => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("select_job_card")}</FormLabel>
                          <Controller
                            name="job_card"
                            control={form.control}
                            render={({ field: { value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_job_card")}
                                options={(jobCards || []).map((jc) => ({
                                  label: `${jc.id} - ${jc.customer_name}`,
                                  value: jc.id,
                                }))}
                                value={
                                  (jobCards || []).find((jc) => jc.id === value)
                                    ? {
                                      label: `${(jobCards || []).find((jc) => jc.id === value)?.id} - ${(jobCards || []).find((jc) => jc.id === value)?.customer_name}`,
                                      value,
                                    }
                                    : null
                                }
                                onChange={() => { }}
                                styles={selectStyles}
                                isSearchable
                                isDisabled
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Customer — disabled but silk/tin fix applied */}
                    <FormField
                      control={form.control}
                      name="ye_bale_nibret_sim"
                      render={() => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("ye_bale_nibret_sim")}</FormLabel>
                          <Controller
                            name="ye_bale_nibret_sim"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_customer_name")}
                                options={(customers || []).map((c) => ({
                                  label: c.name,
                                  value: c.id,
                                }))}
                                value={
                                  (customers || []).find((c) => c.id === value)
                                    ? {
                                      label: (customers || []).find((c) => c.id === value)?.name,
                                      value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  // Fix: immediate clear on deselect, no lag
                                  if (!selectedOption) {
                                    onChange("");
                                    form.setValue("silk_kutir", "");
                                    form.setValue("tin_kutir", "");
                                    return;
                                  }
                                  onChange(selectedOption.value);
                                  const customer = (customers || []).find(
                                    (c) => c.id === selectedOption.value
                                  );
                                  if (customer) {
                                    form.setValue("silk_kutir", customer.phone || "");
                                    form.setValue("tin_kutir", customer.tin_number || "");
                                  }
                                }}
                                styles={selectStyles}
                                isSearchable
                                isClearable
                                isDisabled
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Vehicle Model — disabled */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={() => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("model")}</FormLabel>
                          <Controller
                            name="model"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_a-model")}
                                options={(filteredVehicles || []).map((v) => ({
                                  label: v.model,
                                  value: v.id,
                                }))}
                                value={
                                  (filteredVehicles || []).find((v) => v.id === value)
                                    ? {
                                      label: (filteredVehicles || []).find((v) => v.id === value)?.model,
                                      value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  onChange(selectedOption?.value ?? "");
                                  const vehicle = (filteredVehicles || []).find(
                                    (v) => v.id === selectedOption?.value
                                  );
                                  if (vehicle) {
                                    form.setValue("shanci_kutir", vehicle.shanci_kutir || "");
                                    form.setValue("motor_kutir", vehicle.motor_kutir || "");
                                    form.setValue("targa_kutir", vehicle.license_plate || "");
                                  }
                                }}
                                styles={selectStyles}
                                isSearchable
                                isClearable
                                isDisabled
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shanci Kutir */}
                    <FormField
                      control={form.control}
                      name="shanci_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("shanci_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("shanci_kutir")} {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Motor Kutir */}
                    <FormField
                      control={form.control}
                      name="motor_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("motor_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("motor_kutir")} {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Targa Kutir */}
                    <FormField
                      control={form.control}
                      name="targa_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("targa_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("targa_kutir")} {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Silk Kutir — now auto-filled on customer select */}
                    <FormField
                      control={form.control}
                      name="silk_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("silk_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("silk_kutir")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tin Kutir — now auto-filled on customer select */}
                    <FormField
                      control={form.control}
                      name="tin_kutir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("tin_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("tin_kutir")} {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="ken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("date")}</FormLabel>
                          <FormControl>
                            <Input type="date" className={fieldClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── Assignees ─────────────────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    {t("assignees")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Asrekabi Sim */}
                    <FormField
                      control={form.control}
                      name="asrekabi_sim"
                      render={() => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("asrekabi_sim")}</FormLabel>
                          <Controller
                            name="asrekabi_sim"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_a_user")}
                                options={(users || []).map((u) => ({ label: u.name, value: u.id }))}
                                value={
                                  (users || []).find((u) => u.id === value)
                                    ? { label: (users || []).find((u) => u.id === value)?.name, value }
                                    : null
                                }
                                onChange={(opt) => onChange(opt?.value ?? "")}
                                styles={selectStyles}
                                isSearchable
                                isClearable
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Terekabi Sim */}
                    <FormField
                      control={form.control}
                      name="terekabi_sim"
                      render={() => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("terekabi_sim")}</FormLabel>
                          <Controller
                            name="terekabi_sim"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_a_user")}
                                options={(users || []).map((u) => ({ label: u.name, value: u.id }))}
                                value={
                                  (users || []).find((u) => u.id === value)
                                    ? { label: (users || []).find((u) => u.id === value)?.name, value }
                                    : null
                                }
                                onChange={(opt) => onChange(opt?.value ?? "")}
                                styles={selectStyles}
                                isSearchable
                                isClearable
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ── Items ─────────────────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t("items")}
                    </p>
                    <Button
                      type="button"
                      onClick={addItem}
                      size="sm"
                      className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {items.length === 0 ? t("add_item") : t("add_more")}
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-muted p-8 text-center text-muted-foreground text-sm">
                      {t("No items added yet.")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-[1fr_140px_44px] gap-4 items-end bg-muted/30 rounded-xl p-4 border border-muted"
                        >
                          {/* Product */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.product`}
                            render={() => (
                              <FormItem>
                                <FormLabel className={labelClass}>{t("product_name")}</FormLabel>
                                <Controller
                                  name={`items.${index}.product`}
                                  control={form.control}
                                  render={({ field: { onChange, value } }) => (
                                    <Select
                                      className="w-full react-select-container"
                                      classNamePrefix="react-select"
                                      placeholder={t("select_a_product")}
                                      options={(products || []).map((p) => ({
                                        label: `${p.name} - ${p.part_number}`,
                                        value: p.id,
                                      }))}
                                      value={
                                        (products || []).find((p) => p.id === value)
                                          ? {
                                            label: `${(products || []).find((p) => p.id === value)?.name} - ${(products || []).find((p) => p.id === value)?.part_number}`,
                                            value,
                                          }
                                          : null
                                      }
                                      onChange={(opt) => onChange(opt?.value)}
                                      styles={selectStyles}
                                      isSearchable
                                      isClearable
                                    />
                                  )}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Quantity */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={labelClass}>{t("quantity")}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number" onWheel={(event) => event.currentTarget.blur()}
                                    className={fieldClass}
                                    placeholder={t("quantity")}
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Remove */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-11 w-11 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Submit ─────────────────────────────────────────── */}
                <div className="flex justify-end pt-2 border-t border-muted">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => navigate("/manage-vehicle-part-request")}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 px-8"
                    >
                      {isSubmitting ? t("Saving...") : t("update")}
                    </Button>
                  </div>
                </div>

              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePartRequest;

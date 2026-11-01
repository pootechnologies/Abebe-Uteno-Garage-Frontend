"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Trash2, ClipboardList, Plus, ArrowLeft } from "lucide-react";
import axiosInstance from "@/api/axios";
import {
  updateVehicleOldPart,
  fetchVehicleOldPartById,
} from "../api/vehilceOldPartDelivery";
import { useNavigate, useParams } from "react-router-dom";
import { t } from "i18next";
import Select from "react-select";

// Define interfaces for your data structures
interface Customer {
  id: number;
  name: string;
  tin_number?: string;
  phone?: string;
  organization?: string;
}
interface Vehicle {
  id: number;
  model: string;
  shanci_kutir?: string;
  motor_kutir?: string;
  license_plate?: string;
  customer?: number;
  customer_name?: string;
}
interface User {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
}
interface JobCard {
  id: number;
  customer_name: string;
}
interface Item {
  product: number;
  quantity: number;
  fixed_parts?: string;
}

// Define the schema for a single item
const itemSchema = z.object({
  product: z.number().optional(),
  quantity: z.number().min(0).optional(),
  fixed_parts: z.string().max(50).optional(),
});

// Define the schema for the entire form
const vehicleInformationSchema = z.object({
  job_card: z.union([
    z.string().min(1, t("select_job_card")),
    z.number().min(1, t("select_job_card")),
  ]),
  model: z.union([z.string(), z.number()]).optional(),
  tegagn_mechanic: z.union([
    z.string().min(1, t("select_customer_name")),
    z.number().min(1, t("select_customer_name")),
  ]),
  shanci_kutir: z
    .string()
    .max(100, t("Shanci Kutir must be less than 100 characters"))
    .optional(),
  motor_kutir: z
    .string()
    .max(100, t("Motor Kutir must be less than 100 characters"))
    .optional(),
  targa_kutir: z
    .string()
    .max(100, t("Targa Kutir must be less than 100 characters"))
    .optional(),
  silk_kutir: z
    .string()
    .max(100, t("Silk Kutir must be less than 100 characters"))
    .optional(),
  tin_kutir: z
    .string()
    .max(100, t("Tin Kutir must be less than 100 characters"))
    .optional(),
  ken: z.string().optional(),
  asrekabi_sim: z.union([z.string(), z.number()]).optional(),
  terekabi_sim: z.union([
    z.string().min(1, t("select_a_user")),
    z.number().min(1, t("select_a_user")),
  ]),
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

const UpdateVehicleOldPartDelivery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      job_card: "",
      model: "",
      tegagn_mechanic: "",
      shanci_kutir: "",
      motor_kutir: "",
      targa_kutir: "",
      silk_kutir: "",
      tin_kutir: "",
      ken: "",
      asrekabi_sim: "",
      terekabi_sim: "",
      items: [{ product: undefined, quantity: 0, fixed_parts: "" }],
    },
  });

  const selectedTerekabiId = form.watch("terekabi_sim");
  const formItems = form.watch("items") || [];

  // Fetch old part data
  useEffect(() => {
    const fetchOldPartData = async () => {
      setLoading(true);
      try {
        const response = await fetchVehicleOldPartById(id!);
        form.reset({
          job_card: response.job_card,
          tegagn_mechanic: response.tegagn_mechanic,
          model: response.vehicle,
          shanci_kutir: response.vehicle_shanci_kutir,
          motor_kutir: response.vehicle_motor_kutir,
          targa_kutir: response.vehicle_targa_kutir,
          silk_kutir: response.terekabi_phone,
          tin_kutir: response.terekabi_tin_number,
          ken: response.ken ? new Date(response.ken).toISOString().split('T')[0] : "",
          asrekabi_sim: response.asrekabi_sim,
          terekabi_sim: response.terekabi_sim,
          items: response.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            fixed_parts: item.fixed_parts || "",
          })),
        });
      } catch (error) {
        console.error("Error fetching old part data:", error);
        toast.error(t("Failed to fetch old part data."));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOldPartData();
  }, [id, form]);

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

  // Filter vehicles by selected customer (terekabi_sim)
  useEffect(() => {
    if (selectedTerekabiId) {
      const filtered = vehicles.filter(
        (vehicle) => vehicle.customer === selectedTerekabiId
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [selectedTerekabiId, vehicles]);

  const addItem = () => {
    form.setValue("items", [...formItems, { product: undefined, quantity: 0, fixed_parts: "" }]);
  };

  const removeItem = (index: number) => {
    if (formItems.length > 1) {
      const newItems = [...formItems];
      newItems.splice(index, 1);
      form.setValue("items", newItems);
    }
  };

  const onSubmit = async (values: VehicleInformationFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        customer: parseInt(values.terekabi_sim as string) || 0,
        vehicle: parseInt(values.model as string) || 0,
        mechanic_id: parseInt(values.tegagn_mechanic as string) || 0,
      };
      delete payload.model;
      await updateVehicleOldPart(id!, payload);
      toast.success(t("Vehicle Old Part Delivery updated successfully!"));
      navigate("/manage-vehicle-old-part");
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to update vehicle old part delivery."));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
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
                  {t("update_vehicle_old_part_delivery")} <span className="text-emerald-600">#{id}</span>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* ── Vehicle & Customer Info ─────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    {t("vehicle_information")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Job Card */}
                    <FormField
                      control={form.control}
                      name="job_card"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("select_job_card")}</FormLabel>
                          <Controller
                            name="job_card"
                            control={form.control}
                            render={({ field: { onChange, value } }) => {
                              const getLabelWithOrg = (jc: JobCard) => {
                                const customer = customers.find(c => c?.name === jc.customer_name);
                                return customer?.organization
                                  ? `${jc.id} - ${customer.organization}`
                                  : `${jc.id} - ${jc.customer_name}`;
                              };
                              const selectedJobCard = jobCards?.find((j) => j.id == value);
                              return (
                                <Select
                                  className="w-full react-select-container"
                                  classNamePrefix="react-select"
                                  placeholder={t("select_job_card")}
                                  options={jobCards?.map((jc) => ({
                                    label: getLabelWithOrg(jc),
                                    value: jc.id,
                                  })) || []}
                                  value={
                                    selectedJobCard
                                      ? {
                                        label: getLabelWithOrg(selectedJobCard),
                                        value: selectedJobCard.id,
                                      }
                                      : null
                                  }
                                  onChange={(selectedOption) => onChange(selectedOption?.value)}
                                  styles={selectStyles}
                                  isSearchable
                                  isClearable
                                  isDisabled
                                />
                              );
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tegagn Mechanic */}
                    <FormField
                      control={form.control}
                      name="tegagn_mechanic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("tegagn_mechanic")}</FormLabel>
                          <Controller
                            name="tegagn_mechanic"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_customer_name")}
                                options={users.map((user) => ({
                                  label: user.name,
                                  value: user.id,
                                }))}
                                value={
                                  users.find((u) => u.id == value)
                                    ? {
                                      label: users.find((u) => u.id == value)?.name,
                                      value: value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => onChange(selectedOption?.value)}
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("terekabi_sim")}</FormLabel>
                          <Controller
                            name="terekabi_sim"
                            control={form.control}
                            render={({ field: { onChange, value } }) => {
                              const getCustomerLabel = (c: Customer) => {
                                return c.organization || c.name;
                              };
                              return (
                                <Select
                                  className="w-full react-select-container"
                                  classNamePrefix="react-select"
                                  placeholder={t("select_a_user")}
                                  options={customers.map((c) => ({
                                    label: getCustomerLabel(c),
                                    value: c.id,
                                  }))}
                                  value={
                                    customers.find((c) => c.id == value)
                                      ? {
                                        label: getCustomerLabel(customers.find((c) => c.id == value)!),
                                        value: value,
                                      }
                                      : null
                                  }
                                  onChange={(selectedOption) => {
                                    // Fix immediate clear
                                    if (!selectedOption) {
                                      onChange("");
                                      form.setValue("silk_kutir", "");
                                      form.setValue("tin_kutir", "");
                                      return;
                                    }
                                    onChange(selectedOption.value);
                                    const customer = customers.find((c) => c.id == selectedOption.value);
                                    if (customer) {
                                      form.setValue("tin_kutir", customer.tin_number || "");
                                      form.setValue("silk_kutir", customer.phone || "");
                                    }
                                  }}
                                  styles={selectStyles}
                                  isSearchable
                                  isClearable
                                />
                              );
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
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
                                options={filteredVehicles.map((v) => ({
                                  label: v.model,
                                  value: v.id,
                                }))}
                                value={
                                  filteredVehicles.find((v) => v.id == value)
                                    ? {
                                      label: filteredVehicles.find((v) => v.id == value)?.model,
                                      value: value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  onChange(selectedOption?.value ?? "");
                                  const vehicle = filteredVehicles.find((v) => v.id == selectedOption?.value);
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

                    {/* Silk Kutir */}
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

                    {/* Tin Kutir */}
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

                    {/* Ken */}
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
                      render={({ field }) => (
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
                                options={users.map((user) => ({
                                  label: user.name,
                                  value: user.id,
                                }))}
                                value={
                                  users.find((u) => u.id == value)
                                    ? {
                                      label: users.find((u) => u.id == value)?.name,
                                      value: value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => onChange(selectedOption?.value)}
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

                  </div>

                  {formItems.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-muted p-8 text-center text-muted-foreground text-sm">
                      {t("No items added yet.")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formItems.map((_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_44px] gap-4 items-end bg-muted/30 rounded-xl p-4 border border-muted"
                        >
                          {/* Product */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.product`}
                            render={({ field }) => (
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
                                      options={products.map((product) => ({
                                        label: `${product.name} - ${product.part_number}`,
                                        value: product.id,
                                      }))}
                                      value={
                                        products.find((p) => p.id == value)
                                          ? {
                                            label: `${products.find((p) => p.id == value)?.name
                                              } - ${products.find((p) => p.id == value)?.part_number
                                              }`,
                                            value: value,
                                          }
                                          : null
                                      }
                                      onChange={(selectedOption) => onChange(selectedOption?.value)}
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
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                    value={field.value === undefined ? 0 : field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Fixed Parts */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.fixed_parts`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={labelClass}>{t("fixed_parts")}</FormLabel>
                                <FormControl>
                                  <Input className={fieldClass} placeholder={t("fixed_parts")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={formItems.length <= 1}
                            onClick={() => removeItem(index)}
                            className="h-11 w-11 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      onClick={addItem}
                      size="sm"
                      className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {formItems.length === 0 ? t("add_item") : t("add_more")}
                    </Button>

                  </div>
                </div>

                {/* ── Submit ─────────────────────────────────────────── */}
                <div className="flex justify-end pt-2 border-t border-muted">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => navigate("/manage-vehicle-old-part")}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 px-8"
                    >
                      {submitting ? t("Saving...") : t("update")}
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

export default UpdateVehicleOldPartDelivery;

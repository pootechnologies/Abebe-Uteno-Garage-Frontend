"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Trash2, ClipboardList, Plus } from "lucide-react";
import axiosInstance from "@/api/axios";
import { t } from "i18next";
import Select from "react-select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
}
interface User {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
  part_number?: string;
  category_name?: string;
  description?: string;
  package?: string;
  piece?: string;
  unit?: string;
  buying_price?: string;
  selling_price?: string;
  receipt_no?: string;
  stock?: number;
  supplier_name?: string;
  image?: string;
  user?: string;
}
interface JobCard {
  id: number;
  customer_name: string;
  organization?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  status?: string;
  service_date?: string;
  odometer_reading?: number;
  receipt_id?: string;
  total_cost?: string;
  user?: string;
}
interface Item {
  product: number;
  quantity: number;
}

// Define the schema for a single item
const itemSchema = z.object({
  product: z.number().min(1, t("product_name_required")),
  quantity: z.number().min(1, t("quantity_must_greater_zero")),
});
// Define the schema for the entire form
const vehicleInformationSchema = z.object({
  job_card: z.union([
    z.string().min(1, t("select_job_card")),
    z.number().min(1, t("select_job_card")),
  ]),
  model: z.union([
    z.string().min(1, t("select_a_model")),
    z.number().min(1, t("select_a_model")),
  ]),
  ye_bale_nibret_sim: z.union([
    z.string().min(1, t("select_a_customer")),
    z.number().min(1, t("select_a_customer")),
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
  asrekabi_sim: z.union([
    z.string().min(1, t("select_asrekabi")),
    z.number().min(1, t("select_asrekabi")),
  ]),
  terekabi_sim: z.union([
    z.string().min(1, t("select_terekabi")),
    z.number().min(1, t("select_terekabi")),
  ]),
  items: z.array(itemSchema),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

// Custom styles for react-select
const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "40px",
    padding: "0.25rem 0.5rem",
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  menu: (base: any) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 9999 }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

const AddVehiclePartRequest = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([{ product: 0, quantity: 1 }]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: {
      job_card: "",
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
      items: items,
    },
  });

  const selectedJobCardId = form.watch("job_card");
  const selectedCustomerId = form.watch("ye_bale_nibret_sim");

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/customers/?include_all=True");
        setCustomers(response?.data?.all_results || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error(t("Failed to fetch customers."));
      }
    };
    fetchCustomers();
  }, [t]);

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
  }, [t]);

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
  }, [t]);

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
  }, [t]);

  // Fetch job cards
  const { data: jobCards } = useQuery({
    queryKey: ["jobCards"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/garage/available-jobcard-part-request/"
      );
      return response.data;
    },
  });

  const queryClient = useQueryClient();

  // Filter vehicles by selected customer
  useEffect(() => {
    if (selectedCustomerId) {
      const filtered = vehicles.filter(
        (vehicle) => vehicle.customer === selectedCustomerId
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [selectedCustomerId, vehicles]);

  // Auto-select customer and vehicle when job card is selected
  useEffect(() => {
    if (selectedJobCardId && jobCards) {
      const selectedJobCard = (Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).find(
        (jobCard: JobCard) => jobCard.id == selectedJobCardId
      );
      if (selectedJobCard?.customer_name) {
        const matchingCustomer = customers.find(
          (customer) => customer.name === selectedJobCard.customer_name
        );
        if (matchingCustomer) {
          form.setValue("ye_bale_nibret_sim", matchingCustomer.id);
          // Fix: also populate silk_kutir and tin_kutir from matched customer
          form.setValue("silk_kutir", matchingCustomer.phone || "");
          form.setValue("tin_kutir", matchingCustomer.tin_number || "");
        }
        // Auto-select vehicle model if available
        if (selectedJobCard.vehicle_model) {
          const matchingVehicle = vehicles.find(
            (vehicle) => vehicle.model === selectedJobCard.vehicle_model
          );
          if (matchingVehicle) {
            form.setValue("model", matchingVehicle.id);
            form.setValue("shanci_kutir", matchingVehicle.shanci_kutir || "");
            form.setValue("motor_kutir", matchingVehicle.motor_kutir || "");
            form.setValue("targa_kutir", matchingVehicle.license_plate || selectedJobCard.vehicle_plate || "");
          }
        }
      }
    } else {
      // Fix: clear all auto-filled fields when job card is deselected
      form.setValue("ye_bale_nibret_sim", "");
      form.setValue("model", "");
      form.setValue("shanci_kutir", "");
      form.setValue("motor_kutir", "");
      form.setValue("targa_kutir", "");
      form.setValue("silk_kutir", "");
      form.setValue("tin_kutir", "");
    }
  }, [selectedJobCardId, jobCards, customers, vehicles, form]);

  const addItem = () => {
    setItems([...items, { product: 0, quantity: 1 }]);
    form.setValue("items", [...form.getValues("items"), { product: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    const formItems = [...form.getValues("items")];
    formItems.splice(index, 1);
    form.setValue("items", formItems);
  };

  const onSubmit = async (values: VehicleInformationFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        customer: parseInt(values.ye_bale_nibret_sim as string) || 0,
        vehicle: parseInt(values.model as string) || 0,
      };
      delete (payload as any).ye_bale_nibret_sim;
      delete (payload as any).model;
      await axiosInstance.post(
        "/api/garage/partrequest/",
        payload
      );
      toast.success("Vehicle part request submitted successfully!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["jobCards"] });
      setItems([{ product: 0, quantity: 1 }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit vehicle part request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600 shadow-sm">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("add_vehicle_part_request")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Job Card */}
                <FormField
                  control={form.control}
                  name="job_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("select_job_card")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_job_card")}
                        options={(Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).map((jobCard) => ({
                          label: `${jobCard?.id} - ${jobCard?.organization || jobCard?.customer_name}`,
                          value: jobCard?.id,
                        }))}
                        value={
                          field.value
                            ? {
                              label: `${(Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).find(
                                (jc: any) => jc.id == field.value
                              )?.id
                                } - ${(Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).find(
                                  (jc: any) => jc.id == field.value
                                )?.organization || (Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).find(
                                  (jc: any) => jc.id == field.value
                                )?.customer_name
                                }`,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                        isSearchable
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Customer */}
                <FormField
                  control={form.control}
                  name="ye_bale_nibret_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("ye_bale_nibret_sim")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_customer_name")}
                        options={(customers || []).map((customer) => ({
                          label: customer.organization || customer.name,
                          value: customer.id,
                        }))}
                        value={
                          (customers || []).find((c) => c.id == field.value)
                            ? {
                              label: (customers || []).find((c) => c.id == field.value)
                                ?.organization || (customers || []).find((c) => c.id == field.value)
                                ?.name,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={(selectedOption: any) => {
                          field.onChange(selectedOption?.value ?? "");
                          if (!selectedOption) {
                            // Fix: clear silk/tin immediately on deselect (no lag)
                            form.setValue("silk_kutir", "");
                            form.setValue("tin_kutir", "");
                            return;
                          }
                          const selectedCustomer = (customers || []).find(
                            (c) => c.id == selectedOption?.value
                          );
                          if (selectedCustomer) {
                            form.setValue("tin_kutir", selectedCustomer.tin_number || "");
                            form.setValue("silk_kutir", selectedCustomer.phone || "");
                          }
                        }}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                        isSearchable
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Model */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("model")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_a-model")}
                        options={(filteredVehicles || []).map((vehicle) => ({
                          label: vehicle.model,
                          value: vehicle.id,
                        }))}
                        value={
                          (filteredVehicles || []).find((v) => v.id == field.value)
                            ? {
                              label: (filteredVehicles || []).find(
                                (v) => v.id == field.value
                              )?.model,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={(selectedOption: any) => {
                          field.onChange(selectedOption?.value);
                          const selectedVehicle = (filteredVehicles || []).find(
                            (v) => v.id == selectedOption?.value
                          );
                          if (selectedVehicle) {
                            form.setValue("shanci_kutir", selectedVehicle.shanci_kutir || "");
                            form.setValue("motor_kutir", selectedVehicle.motor_kutir || "");
                            form.setValue("targa_kutir", selectedVehicle.license_plate || "");
                          }
                        }}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                        isSearchable
                        isClearable
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("shanci_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          placeholder={t("shanci_kutir")}
                          {...field}
                          readOnly
                        />
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("motor_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          placeholder={t("motor_kutir")}
                          {...field}
                          readOnly
                        />
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("targa_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          placeholder={t("targa_kutir")}
                          {...field}
                          readOnly
                        />
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("silk_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder={t("silk_kutir")}
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("tin_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          placeholder={t("tin_kutir")}
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Asrekabi Sim */}
                <FormField
                  control={form.control}
                  name="asrekabi_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("asrekabi_sim")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_a_user")}
                        options={(users || []).map((user) => ({
                          label: user.name,
                          value: user.id,
                        }))}
                        value={
                          (users || []).find((u) => u.id == field.value)
                            ? {
                              label: (users || []).find((u) => u.id == field.value)?.name,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                        isSearchable
                        isClearable
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
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("terekabi_sim")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_a_user")}
                        options={(users || []).map((user) => ({
                          label: user.name,
                          value: user.id,
                        }))}
                        value={
                          (users || []).find((u) => u.id == field.value)
                            ? {
                              label: (users || []).find((u) => u.id == field.value)?.name,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                        isSearchable
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Items section */}
              <div className="space-y-6 pt-6 border-t border-muted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
   {/* <div className="h-8 w-1 bg-emerald-500 rounded-full" /> */}
                    <h4 className="text-lg font-bold text-foreground">{t("items")}</h4>
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    className="gap-2 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    {t("add_more")}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {items.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/20 p-5 rounded-2xl border border-muted/50 animate-in slide-in-from-left-2 duration-300 shadow-xs"
                    >
                      <div className="md:col-span-8">
                        <FormField
                          control={form.control}
                          name={`items.${index}.product`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{t("product_name")}</FormLabel>
                              <Select
                                className="w-full react-select-container"
                                classNamePrefix="react-select"
                                placeholder={t("select_a_product")}
                                options={(products || []).map((product) => ({
                                  label: `${product.name} - ${product.part_number}`,
                                  value: product.id,
                                }))}
                                value={
                                  (products || []).find((p) => p.id == field.value)
                                    ? {
                                      label: `${(products || []).find((p) => p.id == field.value)?.name} - ${(products || []).find((p) => p.id == field.value)?.part_number}`,
                                      value: field.value,
                                    }
                                    : null
                                }
                                onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                                styles={{
                                  ...customSelectStyles,
                                  control: (base: any) => ({
                                    ...base,
                                    borderRadius: "0.75rem",
                                    borderColor: "var(--border)",
                                    backgroundColor: "white",
                                    "&:hover": { borderColor: "var(--primary)" }
                                  }),
                                  menu: (base: any) => ({
                                    ...base,
                                    borderRadius: "0.75rem",
                                    overflow: "hidden"
                                  })
                                }}
                                isSearchable
                                isClearable
                                menuPortalTarget={document.body}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{t("quantity")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number" onWheel={(event) => event.currentTarget.blur()}
                                  className="h-[38px] rounded-xl bg-white border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pb-0.5">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-muted">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="px-6 h-11 rounded-xl hover:bg-muted transition-all font-semibold"
                >
                  {t("cancel") || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all font-bold gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddVehiclePartRequest;

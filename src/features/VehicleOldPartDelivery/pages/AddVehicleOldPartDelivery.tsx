"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { submitVehicleOldPart } from "@/features/VehicleOldPartDelivery/api/vehilceOldPartDelivery";
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
}
interface JobCard {
  id: number;
  customer_name: string;
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
  product?: number;
  quantity: number;
  fixed_parts?: string;
}

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
};

// Define the schema for a single item
const itemSchema = z.object({
  product: z.number().optional(),
  quantity: z.number().min(0).optional(),
  fixed_parts: z.string().max(100).optional(),
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

const AddVehicleOldPartDelivery = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([
    { product: undefined, quantity: 0, fixed_parts: "" },
  ]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
      items: items,
    },
  });

  const selectedJobCardId = form.watch("job_card");
  const selectedTerekabiId = form.watch("terekabi_sim");
  const queryClient = useQueryClient();

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

  // Fetch job cards
  const { data: jobCards } = useQuery({
    queryKey: ["jobCards"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/garage/available-jobcard-old-part/"
      );
      return response.data;
    },
  });

  // Auto-select customer when job card is selected
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
          form.setValue("terekabi_sim", matchingCustomer.id);
          form.setValue("tin_kutir", matchingCustomer.tin_number || "");
          form.setValue("silk_kutir", matchingCustomer.phone || "");
        }
      }
    } else {
      form.setValue("terekabi_sim", "");
      form.setValue("tin_kutir", "");
      form.setValue("silk_kutir", "");
    }
  }, [selectedJobCardId, jobCards, customers, form]);

  // Auto-select vehicle model and fill fields when job card is selected
  useEffect(() => {
    if (selectedJobCardId && jobCards) {
      const selectedJobCard = (Array.isArray(jobCards) ? jobCards : jobCards?.results ?? []).find(
        (jobCard: JobCard) => jobCard.id == selectedJobCardId
      );
      if (selectedJobCard?.vehicle_model) {
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
    } else {
      form.setValue("model", "");
      form.setValue("shanci_kutir", "");
      form.setValue("motor_kutir", "");
      form.setValue("targa_kutir", "");
    }
  }, [selectedJobCardId, jobCards, vehicles, form]);

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
    setItems([...items, { product: undefined, quantity: 0, fixed_parts: "" }]);
    form.setValue("items", [...(form.getValues("items") || []), { product: undefined, quantity: 0, fixed_parts: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
      const formItems = [...(form.getValues("items") || [])];
      formItems.splice(index, 1);
      form.setValue("items", formItems);
    }
  };

  const onSubmit = async (values: VehicleInformationFormData) => {
    setSubmitting(true);
    try {
      const customerId = parseInt(values.terekabi_sim as string) || 0;
      const selectedCustomer = customers.find(c => c.id === customerId);
      const payload = {
        ...values,
        customer: customerId,
        vehicle: parseInt(values.model as string) || 0,
        mechanic_id: parseInt(values.tegagn_mechanic as string) || 0,
        organization: selectedCustomer?.organization || "",
      };
      delete (payload as any).model;
      await submitVehicleOldPart(payload);
      toast.success(t("Vehicle Old Part Delivery submitted successfully!"));
      queryClient.invalidateQueries({ queryKey: ["jobCards"] });
      form.reset();
      setItems([{ product: undefined, quantity: 1, fixed_parts: "" }]);
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to submit vehicle old part delivery."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 text-emerald-600">
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("add_vehicle_old_part_delivery")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Job card */}
                 <FormField
                  control={form.control}
                  name="job_card"
                  render={({ field }) => {
                    const jobCardList = Array.isArray(jobCards) ? jobCards : jobCards?.results ?? [];
                    const getLabelWithOrg = (jc: any) => {
                      const customer = customers.find(c => c.name === jc?.customer_name);
                      return customer?.organization
                        ? `${jc.id} - ${customer.organization}`
                        : `${jc.id} - ${jc.customer_name}`;
                    };
                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-foreground/70">{t("select_job_card")}</FormLabel>
                        <Select
                          className="w-full react-select-container"
                          classNamePrefix="react-select"
                          placeholder={t("select_job_card")}
                          options={jobCardList.map((jc) => ({
                            label: getLabelWithOrg(jc),
                            value: jc.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: getLabelWithOrg(jobCardList.find((j: any) => j.id == field.value)),
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
                    );
                  }}
                />

                {/* Tegagn Mechanic */}
                <FormField
                  control={form.control}
                  name="tegagn_mechanic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-foreground/70">{t("tegagn_mechanic")}</FormLabel>
                      <Select
                        className="w-full react-select-container"
                        classNamePrefix="react-select"
                        placeholder={t("select_customer_name")}
                        options={users.map((user) => ({
                          label: user.name,
                          value: user.id,
                        }))}
                        value={
                          users.find((u) => u.id == field.value)
                            ? {
                                label: users.find((u) => u.id == field.value)?.name,
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

                {/* Terekabi sim */}
                <FormField
                  control={form.control}
                  name="terekabi_sim"
                  render={({ field }) => {
                    const getCustomerLabel = (c: Customer) => {
                      return c.organization ? c.organization : c.name;
                    };
                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-bold text-foreground/70">{t("terekabi_sim")}</FormLabel>
                        <Select
                          className="w-full react-select-container"
                          classNamePrefix="react-select"
                          placeholder={t("select_a_user")}
                          options={customers.map((customer) => ({
                            label: getCustomerLabel(customer),
                            value: customer.id,
                          }))}
                          value={
                            customers.find((c) => c.id == field.value)
                              ? {
                                  label: getCustomerLabel(customers.find((c) => c.id == field.value)!),
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            field.onChange(selectedOption?.value);
                            const selectedCustomer = customers.find((c) => c.id == selectedOption?.value);
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
                    );
                  }}
                />

                {/* Model select */}
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
                        options={filteredVehicles.map((vehicle) => ({
                          label: vehicle.model,
                          value: vehicle.id,
                        }))}
                        value={
                          filteredVehicles.find((v) => v.id == field.value)
                            ? {
                                label: filteredVehicles.find((v) => v.id == field.value)?.model,
                                value: field.value,
                              }
                            : null
                        }
                        onChange={(selectedOption: any) => {
                          field.onChange(selectedOption?.value);
                          const selectedVehicle = filteredVehicles.find((v) => v.id == selectedOption?.value);
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
                          className="h-11 rounded-xl bg-muted/50 border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          placeholder={t("silk_kutir")}
                          {...field}
                          readOnly
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

                {/* Asrekabi sim */}
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
                        options={users.map((user) => ({
                          label: user.name,
                          value: user.id,
                        }))}
                        value={
                          users.find((u) => u.id == field.value)
                            ? {
                                label: users.find((u) => u.id == field.value)?.name,
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
                    <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                    <h4 className="text-lg font-bold text-foreground">{t("products")}</h4>
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
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/20 p-5 rounded-2xl border border-muted/50 animate-in slide-in-from-left-2 duration-300"
                      style={{ overflow: 'visible' }}
                    >
                      <div className="md:col-span-5" style={{ position: 'relative', zIndex: 100 }}>
                        <FormField
                          control={form.control}
                          name={`items.${index}.product`}
                          render={({ field }) => (
                            <FormItem style={{ overflow: 'visible' }}>
                              <FormLabel className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{t("product_name")}</FormLabel>
                              <div style={{ position: 'relative', zIndex: 200 }}>
                                <Select
                                  className="w-full react-select-container"
                                  classNamePrefix="react-select"
                                  placeholder={t("select_a_product")}
                                  options={products.map((product) => ({
                                    label: `${product.name} - ${product.part_number}`,
                                    value: product.id,
                                  }))}
                                  value={
                                    products.find((p) => p.id == field.value)
                                      ? {
                                        label: `${products.find((p) => p.id == field.value)?.name} - ${products.find((p) => p.id == field.value)?.part_number}`,
                                        value: field.value,
                                      }
                                      : null
                                  }
                                  onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  menuPlacement="bottom"
                                  menuShouldScrollIntoView={false}
                                  styles={{
                                    ...customSelectStyles,
                                    control: (base: any) => ({
                                      ...base,
                                      borderRadius: "0.75rem",
                                      borderColor: "var(--border)",
                                      backgroundColor: "white",
                                      "&:hover": { borderColor: "var(--primary)" }
                                    }),
                                    menuPortal: (base: any) => ({
                                      ...base,
                                      zIndex: 999999
                                    }),
                                    menu: (base: any) => ({
                                      ...base,
                                      borderRadius: "0.75rem",
                                      overflow: "hidden",
                                      zIndex: 999999
                                    })
                                  }}
                                  isSearchable
                                  isClearable
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
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
                                  onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                  value={field.value === undefined ? 0 : field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.fixed_parts`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{t("fixed_parts")}</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-[38px] rounded-xl bg-white border-muted focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                  placeholder={t("fixed_parts")}
                                  {...field}
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
                  disabled={submitting}
                  className="px-10 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all font-bold gap-2"
                >
                  {submitting ? (
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

export default AddVehicleOldPartDelivery;

"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "react-hot-toast";
import { 
  Trash2, 
  PlusCircle, 
  Car, 
  UserCircle, 
  ClipboardList, 
  Hash, 
  Calendar,
  Contact,
  FileText,
  Wrench,
  Package
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { t } from "i18next";
import {
  updateVehicleOrderVoucher,
  fetchVehicleOrderVoucherById,
} from "../api/vehicleOrderVocher";
import Select from "react-select";
import { formatDateForInput } from "@/utils/formatDate";

// --- Types ---
interface Item {
  item_name: string;
  quantity: number;
  fixed_parts: string;
}
interface User {
  id: number;
  name: string;
}
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
  customer?: number | string;
}
interface JobCard {
  id: number;
  customer_name: string;
}

// --- Zod Schemas ---
const itemSchema = z.object({
  item_name: z
    .string()
    .max(100, t("Item name must be less than 100 characters"))
    .optional(),
  quantity: z.number().min(1, t("quantity_must_greater_zero")).optional(),
  fixed_parts: z
    .string()
    .max(100, t("Fixed parts must be less than 100 characters"))
    .optional(),
});

const vehicleInformationSchema = z.object({
  job_card: z.number(),
  model: z.union([z.string(), z.number()]).optional(),
  ye_bale_nibret_sim: z.union([z.string(), z.number()]).optional(),
  shanci_kutir: z.string().optional(),
  motor_kutir: z.string().optional(),
  targa_kutir: z.string().optional(),
  silk_kutir: z.string().optional(),
  tin_kutir: z.string().optional(),
  ken: z.string().optional(),
  asrekabi_sim: z.union([z.string(), z.number()]).optional(),
  terekabi_sim: z.union([z.string(), z.number()]).optional(),
  items: z.array(itemSchema).optional(),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

// --- Custom Select Styles ---
const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "42px",
    padding: "0.25rem 0.25rem",
    borderRadius: "0.75rem",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#d1d5db",
    },
    boxShadow: "none"
  }),
};

// --- Component ---
const UpdateVehicleOrderVoucher = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);

  // --- Form ---
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
      items: [],
    },
  });

  const { control, watch, reset } = form;
  const selectedCustomerId = watch("ye_bale_nibret_sim");

  // --- useFieldArray for items ---
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // --- Fetch voucher data and prefill form ---
  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        if (!id) {
          toast.error(t("Invalid voucher ID"));
          return;
        }
        const response = await fetchVehicleOrderVoucherById(id);
        if (!response) {
          toast.error(t("No data found for this voucher"));
          return;
        }
        const formattedItems = Array.isArray(response.items)
          ? response.items.map((item: any) => ({
              item_name: item.item_name || "",
              quantity: item.quantity || 1,
              fixed_parts: item.fixed_parts || "",
            }))
          : [];
        const newValues: VehicleInformationFormData = {
          job_card: response.job_card || 0,
          model: response.vehicle || "",
          ye_bale_nibret_sim: response.customer || "",
          shanci_kutir: response.vehicle_shanci_kutir || "",
          motor_kutir: response.vehicle_motor_kutir || "",
          targa_kutir: response.vehicle_targa_kutir || "",
          silk_kutir: response.silk_kutir || "",
          tin_kutir: response.customer_tin_number || "",
          ken: formatDateForInput(response.ken),
          asrekabi_sim: response.asrekabi_sim || "",
          terekabi_sim: response.terekabi_sim || "",
          items: formattedItems,
        };
        reset(newValues);
      } catch (error) {
        console.error("Error fetching voucher data:", error);
        toast.error(t("Failed to fetch voucher data."));
      }
    };
    fetchVoucherData();
  }, [id, reset]);

  // --- Fetch customers ---
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

  // --- Fetch vehicles ---
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/vehicles");
        setVehicles(response?.data?.results || []);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error(t("Failed to fetch vehicles."));
      }
    };
    fetchVehicles();
  }, []);

  // --- Fetch users ---
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

  // --- Fetch job cards ---
  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/garage/jobcard/?page=1&include_all=1"
        );
        setJobCards(response.data.results);
      } catch (error) {
        console.error("Error fetching job cards:", error);
        toast.error(t("Failed to fetch job cards."));
      }
    };
    fetchJobCards();
  }, []);

  // --- Filter vehicles by customer ---
  useEffect(() => {
    if (selectedCustomerId) {
      const filtered = vehicles.filter((v) => v.customer == selectedCustomerId);
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [selectedCustomerId, vehicles]);

  // --- Add / Remove Items ---
  const addItem = () => append({ item_name: "", quantity: 1, fixed_parts: "" });
  const removeItemAt = (index: number) => remove(index);

  // --- Submit ---
  const onSubmit = async (values: VehicleInformationFormData) => {
    try {
      if (!id) {
        toast.error(t("Invalid voucher ID"));
        return;
      }
      const payload = {
        ...values,
        customer: values.ye_bale_nibret_sim || null,
        vehicle: values.model || null,
      };
      await updateVehicleOrderVoucher(id, payload);
      toast.success(t("Vehicle order voucher updated successfully!"));
      navigate("/manage-vehicle-order-voucher");
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error(t("Failed to update vehicle order voucher."));
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate("/manage-vehicle-order-voucher")}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {t("manage_vehicle_order_voucher")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-gray-900">
                  {t("update_vehicle_order_voucher")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex items-center space-x-3">
            <div className="bg-blue-600 p-2 text-white rounded-lg shadow-md shadow-blue-200">
               <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {t("update_vehicle_order_voucher")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">{t("general_information") || "General Information"}</h2>
                </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Job Card */}
                <FormField
                  control={control}
                  name="job_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{t("select_job_card")}</FormLabel>
                      <FormControl>
                        <Controller
                          name="job_card"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              className="w-full"
                              classNamePrefix="react-select"
                              placeholder={t("select_job_card")}
                              options={jobCards.map((jc: JobCard) => ({
                                label: `${jc.id} - ${jc.customer_name}`,
                                value: jc.id,
                              }))}
                              value={
                                jobCards.find((jc) => jc.id === value)
                                  ? {
                                      label: `${
                                        jobCards.find((jc) => jc.id === value)?.id
                                      } - ${
                                        jobCards.find((jc) => jc.id === value)
                                          ?.customer_name
                                      }`,
                                      value: value,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                onChange(selectedOption?.value)
                              }
                              styles={customSelectStyles}
                              isSearchable
                              isClearable
                              isDisabled
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
                {/* Customer */}
                <FormField
                  control={control}
                  name="ye_bale_nibret_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" />{t("ye_bale_nibret_sim")}</FormLabel>
                      <FormControl>
                        <Controller
                          name="ye_bale_nibret_sim"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              className="w-full"
                              classNamePrefix="react-select"
                              placeholder={t("select_customer_name")}
                              options={customers.map((c: Customer) => ({
                                label: c.name,
                                value: c.id,
                              }))}
                              value={
                                customers.find((c) => c.id === value)
                                  ? {
                                      label: customers.find((c) => c.id === value)
                                        ?.name,
                                      value: value,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                onChange(selectedOption?.value);
                                const customer = customers.find(
                                  (c) => c.id === selectedOption?.value
                                );
                                if (customer) {
                                  form.setValue(
                                    "tin_kutir",
                                    customer.tin_number || ""
                                  );
                                  form.setValue("silk_kutir", customer.phone || "");
                                }
                              }}
                              styles={customSelectStyles}
                              isSearchable
                              isClearable
                              isDisabled
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
                {/* Vehicle Model */}
                <FormField
                  control={control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Car className="w-3.5 h-3.5" />{t("model")}</FormLabel>
                      <FormControl>
                        <Controller
                          name="model"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              className="w-full"
                              classNamePrefix="react-select"
                              placeholder={t("select_a-model")}
                              options={filteredVehicles.map((v: Vehicle) => ({
                                label: v.model,
                                value: v.id,
                              }))}
                              value={
                                filteredVehicles.find((v) => v.id === value)
                                  ? {
                                      label: filteredVehicles.find(
                                        (v) => v.id === value
                                      )?.model,
                                      value: value,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                onChange(selectedOption?.value);
                                const v = filteredVehicles.find(
                                  (v) => v.id === selectedOption?.value
                                );
                                if (v) {
                                  form.setValue(
                                    "shanci_kutir",
                                    v.shanci_kutir || ""
                                  );
                                  form.setValue("motor_kutir", v.motor_kutir || "");
                                  form.setValue(
                                    "targa_kutir",
                                    v.license_plate || ""
                                  );
                                }
                              }}
                              styles={customSelectStyles}
                              isSearchable
                              isClearable
                              isDisabled
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-bold text-rose-500" />
                    </FormItem>
                  )}
                />
                {/* Other info */}
                <FormField
                  control={control}
                  name="shanci_kutir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{t("shanci_kutir")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" readOnly disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="motor_kutir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" />{t("motor_kutir")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" readOnly disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="targa_kutir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{t("targa_kutir")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" readOnly disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="silk_kutir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{t("silk_kutir")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="tin_kutir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{t("tin_kutir")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" readOnly disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="ken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{t("date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-full p-2.5 h-auto bg-gray-50 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all cursor-not-allowed" disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="asrekabi_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Contact className="w-3.5 h-3.5" />{t("asrekabi_sim")}</FormLabel>
                      <FormControl>
                        <Controller
                          name="asrekabi_sim"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              className="w-full"
                              classNamePrefix="react-select"
                              placeholder={t("select_a_user")}
                              options={users.map((user: User) => ({
                                label: user.name,
                                value: user.id,
                              }))}
                              value={
                                users.find((u) => u.id === value)
                                  ? {
                                      label: users.find((u) => u.id === value)
                                        ?.name,
                                      value: value,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                onChange(selectedOption?.value)
                              }
                              styles={customSelectStyles}
                              isSearchable
                              isClearable
                            />
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="terekabi_sim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5"><Contact className="w-3.5 h-3.5" />{t("terekabi_sim")}</FormLabel>
                      <FormControl>
                        <Controller
                          name="terekabi_sim"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              className="w-full"
                              classNamePrefix="react-select"
                              placeholder={t("select_a_user")}
                              options={users.map((user: User) => ({
                                label: user.name,
                                value: user.id,
                              }))}
                              value={
                                users.find((u) => u.id === value)
                                  ? {
                                      label: users.find((u) => u.id === value)
                                        ?.name,
                                      value: value,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) =>
                                onChange(selectedOption?.value)
                              }
                              styles={customSelectStyles}
                              isSearchable
                              isClearable
                            />
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* --- Items --- */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2 px-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-blue-600"/>{t("items")}</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-2 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <PlusCircle className="h-4 w-4" />
                  {fields.length === 0 ? t("add_item") : t("add_more")}
                </Button>
              </div>

              <div className="space-y-6">
                {fields.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center text-gray-500">
                    {t("No items added yet.")}
                  </div>
                ) : (
                  fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="bg-white border p-6 md:p-8 rounded-2xl space-y-6 relative shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border-4 border-gray-50 shadow-sm z-10 text-xs">
                        {index + 1}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                        onClick={() => removeItemAt(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <FormField
                          control={control}
                          name={`items.${index}.item_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">{t("item_name")}</FormLabel>
                              <FormControl>
                                <Input {...field} className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">{t("quantity")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number" onWheel={(event) => event.currentTarget.blur()}
                                  {...field}
                                  className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all"
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`items.${index}.fixed_parts`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">{t("fixed_parts")}</FormLabel>
                              <FormControl>
                                <Input {...field} className="w-full p-2.5 h-auto bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 text-sm font-medium transition-all" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {form.formState.isSubmitting ? t("updating") || "Updating..." : t("update")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateVehicleOrderVoucher;

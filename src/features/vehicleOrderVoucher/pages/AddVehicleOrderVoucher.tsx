"use client";
import { useState, useEffect } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { t } from "i18next";
import { submitVehicleOrderVoucher } from "../api/vehicleOrderVocher";
import Select from "react-select";

// Interfaces for typed state
interface Customer {
  id: string;
  name: string;
  tin_number?: string;
  phone?: string;
}
interface Vehicle {
  id: string;
  model: string;
  shanci_kutir?: string;
  motor_kutir?: string;
  license_plate?: string;
  customer?: string;
}
interface User {
  id: string;
  name: string;
}

// Define the schema for a single item
const itemSchema = z.object({
  item_name: z
    .string()
    .max(100, t("Item name must be less than 100 characters"))
    .optional(),
  quantity: z.number().optional(),
  fixed_parts: z
    .string()
    .max(100, t("Fixed parts must be less than 100 characters"))
    .optional(),
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
  items: z.array(itemSchema).optional(),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

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

const AddVehicleOrderVoucher = () => {
  const [items, setItems] = useState<
    { item_name: string; quantity: number; fixed_parts: string }[]
  >([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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
      items: [],
    },
  });

  const selectedJobCardId = form.watch("job_card");
  const selectedCustomerId = form.watch("ye_bale_nibret_sim");

  // Fetch job cards
  const { data: jobCards } = useQuery({
    queryKey: ["jobCards"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/garage/available-jobcard-order-voucher"
      );
      return response.data;
    },
  });

  // Create a client
  const queryClient = useQueryClient();

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/customers/");
        setCustomers(response?.data?.results);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error(
          (error as any)?.response?.data?.message || t("Failed to fetch customers.")
        );
      }
    };
    fetchCustomers();
  }, [t]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosInstance.get("/api/garage/vehicles");
        setVehicles(response?.data?.results);
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

  // Filter vehicles by selected customer
  useEffect(() => {
    if (selectedCustomerId) {
      const filtered = vehicles.filter(
        (vehicle) => vehicle.customer == selectedCustomerId
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
        (jobCard: any) => jobCard.id == selectedJobCardId
      );
      if (selectedJobCard?.customer_name) {
        const matchingCustomer = customers.find(
          (customer) => customer.name === selectedJobCard.customer_name
        );
        if (matchingCustomer) {
          form.setValue("ye_bale_nibret_sim", matchingCustomer.id);
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
      form.setValue("ye_bale_nibret_sim", "");
      form.setValue("model", "");
      form.setValue("shanci_kutir", "");
      form.setValue("motor_kutir", "");
      form.setValue("targa_kutir", "");
    }
  }, [selectedJobCardId, jobCards, customers, vehicles, form]);

  const mutation = useMutation({
    mutationFn: submitVehicleOrderVoucher,
    onSuccess: () => {
      toast.success("Vehicle order voucher submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobCards"] });
      queryClient.invalidateQueries({ queryKey: ["vehicleOrderVoucher"] });
      // Reset form and items
      form.reset({
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
        items: [],
      });
      setItems([]);
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
      toast.error(
        (error as any)?.response?.data?.error ||
          "Failed to submit vehicle order voucher."
      );
    },
  });

  const addItem = () => {
    setItems([...items, { item_name: "", quantity: 1, fixed_parts: "" }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const onSubmit = (values: VehicleInformationFormData) => {
    const payload = {
      ...values,
      customer: values.ye_bale_nibret_sim || null,
      vehicle: values.model || null,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-[1000px] mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            {t("add_vehicle_order_voucher")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Card */}
                <FormField
                  control={form.control}
                  name="job_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("select_job_card")}</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder={t("select_job_card")}
                          options={(Array.isArray(jobCards)
                            ? jobCards
                            : (jobCards as any)?.results ?? []
                          ).map((jobCard: any) => ({
                            label: `${jobCard?.id} - ${jobCard?.customer_name}`,
                            value: jobCard?.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: `${
                                    (Array.isArray(jobCards)
                                      ? jobCards
                                      : (jobCards as any)?.results ?? []
                                    ).find((jc: any) => jc.id == field.value)?.id
                                  } - ${
                                    (Array.isArray(jobCards)
                                      ? jobCards
                                      : (jobCards as any)?.results ?? []
                                    ).find((jc: any) => jc.id == field.value)
                                      ?.customer_name
                                  }`,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption?.value)
                          }
                          styles={customSelectStyles}
                          isSearchable
                          isClearable
                        />
                      </FormControl>
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
                      <FormLabel>{t("ye_bale_nibret_sim")}</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder={t("select_customer_name")}
                          options={customers.map((customer) => ({
                            label: customer.name,
                            value: customer.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: customers.find((c) => c.id == field.value)
                                    ?.name,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption?.value);
                            const selectedCustomer = customers.find(
                              (c) => c.id == selectedOption?.value
                            );
                            if (selectedCustomer) {
                              form.setValue(
                                "tin_kutir",
                                selectedCustomer.tin_number || ""
                              );
                              form.setValue(
                                "silk_kutir",
                                selectedCustomer.phone || ""
                              );
                            }
                          }}
                          styles={customSelectStyles}
                          isSearchable
                          isClearable
                        />
                      </FormControl>
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
                      <FormLabel>{t("model")}</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder={t("select_a-model")}
                          options={filteredVehicles.map((vehicle) => ({
                            label: vehicle.model,
                            value: vehicle.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: filteredVehicles.find(
                                    (v) => v.id == field.value
                                  )?.model,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption?.value);
                            const selectedVehicle = filteredVehicles.find(
                              (v) => v.id == selectedOption?.value
                            );
                            if (selectedVehicle) {
                              form.setValue(
                                "shanci_kutir",
                                selectedVehicle.shanci_kutir || ""
                              );
                              form.setValue(
                                "motor_kutir",
                                selectedVehicle.motor_kutir || ""
                              );
                              form.setValue(
                                "targa_kutir",
                                selectedVehicle.license_plate || ""
                              );
                            }
                          }}
                          styles={customSelectStyles}
                          isSearchable
                          isClearable
                        />
                      </FormControl>
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
                      <FormLabel>{t("shanci_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("shanci_kutir")}
                          {...field}
                          readOnly
                          disabled
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
                      <FormLabel>{t("motor_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("motor_kutir")}
                          {...field}
                          readOnly
                          disabled
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
                      <FormLabel>{t("targa_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("targa_kutir")}
                          {...field}
                          readOnly
                          disabled
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
                      <FormLabel>{t("silk_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("silk_kutir")}
                          {...field}
                          disabled
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
                      <FormLabel>{t("tin_kutir")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("tin_kutir")}
                          {...field}
                          readOnly
                          disabled
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
                      <FormLabel>{t("asrekabi_sim")}</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder={t("select_a_user")}
                          options={users.map((user) => ({
                            label: user.name,
                            value: user.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: users.find((u) => u.id == field.value)?.name,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption?.value)
                          }
                          styles={customSelectStyles}
                          isSearchable
                          isClearable
                        />
                      </FormControl>
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
                      <FormLabel>{t("terekabi_sim")}</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder={t("select_a_user")}
                          options={users.map((user) => ({
                            label: user.name,
                            value: user.id,
                          }))}
                          value={
                            field.value
                              ? {
                                  label: users.find((u) => u.id == field.value)?.name,
                                  value: field.value,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption?.value)
                          }
                          styles={customSelectStyles}
                          isSearchable
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Items section */}
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">{t("items")}</h4>
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">
                    {t("No items added yet.")}
                  </p>
                ) : (
                  items.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.item_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("item_name")}</FormLabel>
                            <FormControl>
                              <Input
                                className="p-5"
                                placeholder={t("item_name")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("quantity")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number" onWheel={(event) => event.currentTarget.blur()}
                                className="p-5"
                                placeholder={t("quantity")}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.fixed_parts`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("fixed_parts")}</FormLabel>
                            <FormControl>
                              <Input
                                className="p-5"
                                placeholder={t("fixed_parts")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {items.length === 0 ? t("add_item") : t("add_more")}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t("submitting...") : t("submit")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleOrderVoucher;

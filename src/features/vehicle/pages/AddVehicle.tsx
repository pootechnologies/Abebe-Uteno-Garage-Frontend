import React, { useEffect, useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { t } from "i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useSubmitVehicle } from "../api/vehicle.ts";
import { getAllCustomers } from "../../customers/api/customer.ts";
import { useTranslation } from "react-i18next";
import { CreateCustomerModal } from "@/features/customers/components/CreateCustomerModal.tsx";
import Select from "react-select";
import { useSubmitLock } from "@/hooks/useSubmitLock";
import {
  Car,
  Hash,
  Settings,
  Calendar,
  Image as ImageIcon,
  UserCircle,
} from "lucide-react";

const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "44px",
    paddingLeft: "2rem",
    borderRadius: "0.75rem",
    backgroundColor: "hsl(var(--muted) / 0.2)",
    borderColor: "hsl(var(--muted-foreground) / 0.2)",
    boxShadow: "none",
    "&:hover": {
      borderColor: "hsl(var(--muted-foreground) / 0.3)",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#059669"
      : state.isFocused
        ? "rgba(16, 185, 129, 0.1)"
        : null,
    color: state.isSelected ? "white" : "inherit",
    "&:active": {
      backgroundColor: "#059669",
    },
  }),
};

export default function AddVehicle() {
  const { t } = useTranslation();
  const { mutateAsync, isLoading } = useSubmitVehicle();
  const [isSubmitting, lock] = useSubmitLock();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Define the schema inside the component
  const vehicleSchema = z.object({
    customer: z.string().min(1, { message: t("customer_name_required") }),
    license_plate: z
      .string()
      .min(1, { message: t("license_plate_required") })
      .max(20, { message: t("license_plate_max_length") }),
    motor_kutir: z
      .string()
      .max(50, { message: t("motor_kutir_max_length") })
      .optional(),
    shanci_kutir: z
      .string()
      .max(50, { message: t("shanci_kutir_max_length") })
      .optional(),
    model: z
      .string()
      .max(50, { message: t("model_max_length") })
      .optional(),
    year: z
      .coerce
      .number()
      .min(1900, { message: t("year_min") })
      .max(new Date().getFullYear(), { message: t("year_max") })
      .optional(),
    color: z
      .string()
      .max(30, { message: t("color_max_length") })
      .optional(),
    image: z.instanceof(File).optional().nullable(),
  });

  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      customer: "",
      license_plate: "",
      motor_kutir: "",
      shanci_kutir: "",
      model: "",
      year: undefined,
      color: "",
      image: null,
    },
  });

  const { data, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: getAllCustomers,
    refetchInterval: 2000,
  });

  const customers = Array.isArray(data) ? data : [];

  useEffect(() => {
    const imageFile = form.watch("image");

    if (!imageFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.watch("image")]);

  const clearImage = () => {
    form.setValue("image", null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = useCallback(
    (values: any) =>
      lock(async () => {
        await mutateAsync(values);
        form.reset();
        setPreview(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }),
    [lock, mutateAsync, form]
  );

  const openCustomerModal = () => setIsCustomerModalOpen(true);
  const closeCustomerModal = () => setIsCustomerModalOpen(false);
  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Car className="h-6 w-6" />
            </div>
            {t("add_vehicle")}
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div className="flex items-end gap-3 md:col-span-2">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {t("customer")}
                      </FormLabel>

                      <FormControl>
                        <div className="relative group">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />

                          <Controller
                            name="customer"
                            control={form.control}
                            render={({ field: { onChange, value, ref } }) => (
                              <Select
                                inputRef={ref}
                                className="w-full"
                                classNamePrefix="react-select"
                                placeholder={t("select_a_customer")}
                                options={customers.map((customer) => ({
                                  label: customer.organization,
                                  value: String(customer.id),
                                }))}
                                value={
                                  customers.find(
                                    (c) => String(c.id) === value
                                  )
                                    ? {
                                        label: customers.find(
                                          (c) => String(c.id) === value
                                        )?.organization,
                                        value: value,
                                      }
                                    : null
                                }
                                onChange={(selectedOption) =>
                                  onChange(selectedOption?.value)
                                }
                                isLoading={isLoadingCustomers}
                                isSearchable
                                isClearable
                                styles={customSelectStyles}
                              />
                            )}
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={openCustomerModal}
                  className="h-11 px-4 rounded-xl border border-muted-foreground/20 bg-muted/20 text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all font-medium"
                >
                  {t("add_customers")}
                </Button>
              </div>

              {/* License Plate */}
              <FormField
                control={form.control}
                name="license_plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("license_plate")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("motor_kutir")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("shanci_kutir")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>

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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("model")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("year")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color */}
              {/*
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("color")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              */}

              {/* Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("image")}
                    </FormLabel>

                    <FormControl>
                      <div className="relative group">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />

                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="pl-10 pt-2 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 cursor-pointer text-gray-500 dark:text-gray-400"
                          onChange={(e) =>
                            onChange(e.target.files?.[0] || null)
                          }
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {preview && (
              <div className="mt-6 relative inline-block">
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                >
                  &times;
                </button>

                <img
                  src={preview}
                  alt={t("preview")}
                  className="h-40 w-auto object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={openImageModal}
                />
              </div>
            )}

            <div className="mt-8 flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting")}
                  </div>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Customer Modal */}
      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={closeCustomerModal}
      />

      {/* Image Preview Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
            <div className="flex justify-end">
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4">
              <img
                src={preview ?? ""}
                alt={t("full_size_preview")}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

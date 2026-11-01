import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Trash2, ClipboardList, Plus, ArrowLeft } from "lucide-react";
import { t } from "i18next";
import {
  getOldPartById,
  updateOldPart,
} from "@/features/VehicleOldPartDelivery/api/vehilceOldPartDelivery.ts";

// Define the schema for a single item
const itemSchema = z.object({
  item_name: z
    .string()
    .max(100, t("Item name must be less than 100 characters")),
  quantity: z.number().min(1, t("quantity_must_greater_zero")),
});

// Define the schema for the entire form
const vehicleInformationSchema = z.object({
  model: z.string().max(100, t("Model must be less than 100 characters")),
  ye_bale_nibret_sim: z
    .string()
    .max(100, t("Ye Bale Nibret Sim must be less than 100 characters")),
  shanci_kutir: z
    .string()
    .max(100, t("Shanci Kutir must be less than 100 characters")),
  motor_kutir: z
    .string()
    .max(100, t("Motor Kutir must be less than 100 characters")),
  targa_kutir: z
    .string()
    .max(100, t("Targa Kutir must be less than 100 characters")),
  silk_kutir: z
    .string()
    .max(100, t("Silk Kutir must be less than 100 characters")),
  tin_kutir: z
    .string()
    .max(100, t("Tin Kutir must be less than 100 characters")),
  ken: z.string(),
  asrekabi_sim: z
    .string()
    .max(100, t("Asrekabi Sim must be less than 100 characters")),
  terekabi_sim: z
    .string()
    .max(100, t("Terekabi Sim must be less than 100 characters")),
  items: z.array(itemSchema),
});

type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;

const UpdateOldPartDelivery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: partRequest,
    isLoading,
    isError,
  } = useQuery<VehicleInformationFormData>({
    queryKey: ["vehicleOldPartDetail", id],
    queryFn: () => getOldPartById(id!),
    onError: () => toast.error(t("Failed to load part request details")),
  });

  const form = useForm<VehicleInformationFormData>({
    resolver: zodResolver(vehicleInformationSchema),
    defaultValues: partRequest || {
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

  const { reset, watch, setValue } = form;
  const items = watch("items") || [];

  useEffect(() => {
    if (partRequest) {
      reset(partRequest);
    }
  }, [partRequest, reset]);

  const handleSubmit = (values: VehicleInformationFormData) => {
    setIsSubmitting(true);
    updateOldPart(
      { id: id!, ...values },
      {
        onSuccess: () => {
          toast.success(t("Part request updated successfully!"));
          queryClient.invalidateQueries({ queryKey: ["vehicleOldPartDetail", id] });
          navigate("/manage-vehicle-old-part");
        },
        onError: () => {
          toast.error(t("Failed to update part request."));
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  const addItem = () => {
    const currentItems = form.getValues("items") || [];
    setValue("items", [...currentItems, { item_name: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = [...(form.getValues("items") || [])];
    currentItems.splice(index, 1);
    setValue("items", currentItems);
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
            onClick={() => navigate("/manage-vehicle-old-part")}
          >
            {t("Go back")}
          </Button>
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
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

                {/* ── Vehicle & Customer Info ─────────────────────────── */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    {t("vehicle_information")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Model */}
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>{t("model")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("model")} {...field} />
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
                          <FormLabel className={labelClass}>{t("ye_bale_nibret_sim")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("ye_bale_nibret_sim")} {...field} />
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
                          <FormLabel className={labelClass}>{t("shanci_kutir")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("shanci_kutir")} {...field} />
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
                            <Input className={fieldClass} placeholder={t("motor_kutir")} {...field} />
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
                            <Input className={fieldClass} placeholder={t("targa_kutir")} {...field} />
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
                            <Input className={fieldClass} placeholder={t("tin_kutir")} {...field} />
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
                            <Input type="date" className={fieldClass} placeholder={t("date")} {...field} />
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
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("asrekabi_sim")} {...field} />
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
                          <FormLabel className={labelClass}>{t("terekabi_sim")}</FormLabel>
                          <FormControl>
                            <Input className={fieldClass} placeholder={t("terekabi_sim")} {...field} />
                          </FormControl>
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
                          {/* Item Name */}
                          <FormField
                            control={form.control}
                            name={`items.${index}.item_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={labelClass}>{t("item_name")}</FormLabel>
                                <FormControl>
                                  <Input className={fieldClass} placeholder={t("item_name")} {...field} />
                                </FormControl>
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
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      onClick={() => navigate("/manage-vehicle-old-part")}
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

export default UpdateOldPartDelivery;

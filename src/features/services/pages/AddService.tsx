import { t } from "i18next";
import { toast } from "react-hot-toast";
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
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitService } from "../api/services";
import { Wrench, Tag, Banknote, Clock, FileText } from "lucide-react";
import CreatableSelect from "react-select/creatable";

import products from "../../../products.json";

// Zod Schema
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format")
    .optional(),
  duration: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function AddService() {
  const queryClient = useQueryClient();
  const [unit, setUnit] = useState("hour");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Populate service options from JSON
  const serviceOptions = [...new Set(products.map((product) => product.description))].map(
    (description) => ({ value: description, label: description }),
  );

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      cost: "",
      duration: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitService,
    onSuccess: () => {
      toast.success("Service Submitted Successfully");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      form.reset();
    },
    onError: () => {
      toast.error(t("failed_to_submit_service"));
    },
  });

  const onSubmit = (values: ServiceFormData) => {
    const payload: Record<string, unknown> = {
      description: values.description,
      cost: values.cost,
    };

    if (selectedService) {
      payload.name = selectedService;
    } else {
      payload.name = values.name;
    }

    if (values.duration) {
      payload.duration = `${values.duration} ${unit}${Number(values.duration) > 1 ? "s" : ""}`;
    }

    submitMutation.mutate(payload);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Wrench className="h-6 w-6" />
            </div>
            {t("add_service")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("name")}
                    </FormLabel>
                    <FormControl>
                      <Controller
                        name="name"
                        control={form.control}
                        render={({ field: { onChange, value, ...rest } }) => (
                          <CreatableSelect
                            {...rest}
                            options={serviceOptions}
                            onChange={(option) => {
                              if (option) {
                                if (typeof option === 'string') {
                                  onChange(option);
                                  setSelectedService(option);
                                } else {
                                  onChange(option.label);
                                  setSelectedService(option.label);
                                }
                              } else {
                                onChange('');
                                setSelectedService(null);
                              }
                            }}
                            value={value ? { label: value, value: value } : null}
                            placeholder={t("service_name")}
                            isClearable
                            className="w-full react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '44px',
                                borderRadius: '0.75rem',
                                borderColor: 'var(--border)',
                                backgroundColor: 'transparent',
                                '&:hover': { borderColor: 'rgb(16 185 129)' },
                              }),
                              menu: (base) => ({
                                ...base,
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                zIndex: 100,
                              }),
                            }}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("cost")} (ETB)
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("cost")}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration + Unit */}
              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {t("duration")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                          <Input
                            className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                            placeholder={t("duration")}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 pb-2">
                    {t("unit")}
                  </FormLabel>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="h-11 px-3 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all outline-none"
                  >
                    <option value="hour">{t("hour")}</option>
                    <option value="day">{t("day")}</option>
                  </select>
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("description")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all w-full"
                          placeholder={t("description")}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-muted">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
              >
                {submitMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("submitting...")}
                  </div>
                ) : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

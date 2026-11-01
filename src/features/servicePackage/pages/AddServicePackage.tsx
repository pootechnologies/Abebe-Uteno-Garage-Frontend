// components/AddServicePackage.tsx
import { toast } from "react-hot-toast";
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
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitServicePackage } from "../api/servicePackage";
import { t } from "i18next";
import { PackageSearch, FileText, Banknote, Clock } from "lucide-react";

// Zod Schema for ServicePackage
const servicePackageSchema = z.object({
  name: z.enum(["Service A", "Service B", "Service C", "Service D"], {
    required_error: "Please select a package type.",
  }),
  description: z.string().optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format."),
  duration: z.string().optional(),
});

type ServicePackageFormData = z.infer<typeof servicePackageSchema>;

const options = [
  { value: "Service A", label: "Service A" },
  { value: "Service B", label: "Service B" },
  { value: "Service C", label: "Service C" },
  { value: "Service D", label: "Service D" },
];

export default function AddServicePackage() {
  const queryClient = useQueryClient();
  const [unit, setUnit] = useState("hour");

  const form = useForm<ServicePackageFormData>({
    resolver: zodResolver(servicePackageSchema),
    defaultValues: {
      name: "Service A",
      description: "",
      cost: "",
      duration: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitServicePackage,
    onSuccess: () => {
      toast.success("Service package submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["servicePackages"] });
      form.reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.name);
      console.error(error);
    },
  });

  const onSubmit = (values: ServicePackageFormData) => {
    const payload: Record<string, unknown> = {
      name: values.name,
      description: values.description,
      cost: values.cost,
    };

    // Only add duration to payload if it's not empty
    if (values.duration) {
      payload.duration = `${values.duration} ${unit}`;
    }

    submitMutation.mutate(payload);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto mb-40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <PackageSearch className="h-6 w-6" />
            </div>
            {t("add_service_package")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Type */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("package_type")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        options={options}
                        value={options.find((option) => option.value === field.value)}
                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                        className="w-full"
                        classNamePrefix="select"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: '44px',
                            backgroundColor: 'rgba(241, 245, 249, 0.5)',
                            borderColor: state.isFocused ? 'rgba(16, 185, 129, 0.5)' : 'rgba(100, 116, 139, 0.2)',
                            borderRadius: '0.75rem',
                            boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(16, 185, 129, 0.5)'
                            }
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? 'rgba(16, 185, 129, 0.9)' : state.isFocused ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: state.isSelected ? 'white' : 'inherit',
                            cursor: 'pointer',
                            '&:active': {
                              backgroundColor: 'rgba(16, 185, 129, 0.2)'
                            }
                          })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cost */}
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
                          placeholder="e.g. 150.75"
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

              {/* Description */}
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
                        <FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Textarea
                          className="pl-10 min-h-[100px] bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder="Enter a description for the service package"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
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

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { 
  Briefcase, 
  FileText, 
  Banknote, 
  Clock, 
  Pencil
} from "lucide-react";
import { toast } from "react-hot-toast";

const updateServicePackageSchema = z.object({
  name: z.string().min(1, "Package type is required"),
  description: z.string().optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format")
    .optional(),
  duration: z.string().optional(),
});

type UpdateServicePackageFormData = z.infer<typeof updateServicePackageSchema>;

interface UpdateServicePackageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  servicePackage: any;
  onSubmit: (updatedData: any) => Promise<void>;
  formData?: any;
  onInputChange?: any;
}

export const UpdateServicePackageModal = ({
  isOpen,
  onOpenChange,
  servicePackage,
  onSubmit,
}: UpdateServicePackageModalProps) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState("hour");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateServicePackageFormData>({
    resolver: zodResolver(updateServicePackageSchema),
    defaultValues: {
      name: "",
      description: "",
      cost: "",
      duration: "",
    },
  });

  const { register, handleSubmit, reset, formState, control } = form;
  const { errors } = formState;

  const serviceOptions = [
    { value: "Service A", label: `${t("service")} A` },
    { value: "Service B", label: `${t("service")} B` },
    { value: "Service C", label: `${t("service")} C` },
    { value: "Service D", label: `${t("service")} D` },
  ];

  useEffect(() => {
    if (servicePackage) {
      const parts = servicePackage.duration?.split(" ") || [];
      const numeric = parts[0] || "";
      const extractedUnit = parts[1]?.replace(/s$/, "") || "hour";
      setUnit(extractedUnit);

      reset({
        name: servicePackage.name || "",
        description: servicePackage.description || "",
        cost: servicePackage.cost || "",
        duration: numeric,
      });
    }
  }, [servicePackage, reset]);

  const handleFormSubmit = async (values: UpdateServicePackageFormData) => {
    setIsSubmitting(true);
    try {
      const updatedData: Record<string, unknown> = {
        name: values.name,
        description: values.description,
        cost: values.cost,
      };

      if (values.duration) {
        updatedData.duration = `${values.duration} ${unit}${Number(values.duration) > 1 ? "s" : ""}`;
      }

      await onSubmit(updatedData);
    } catch (error) {
      console.error("Error updating service package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[70vh]">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <Pencil className="h-5 w-5" />
              </div>
              {t("update_service_package")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("package_type")}
              </Label>
              <div className="relative group">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={serviceOptions}
                      value={serviceOptions.find((option) => option.value === field.value)}
                      onChange={(selectedOption) => field.onChange(selectedOption?.value || "")}
                      isDisabled={true}
                      className="w-full react-select-container"
                      classNamePrefix="react-select"
                      placeholder={t("select_service")}
                      styles={{
                        control: (base) => ({
                          ...base,
                          paddingLeft: "2rem",
                          borderRadius: "0.75rem",
                          borderColor: errors.name ? "#ef4444" : "var(--border)",
                          backgroundColor: "var(--muted)",
                          opacity: 0.8,
                          height: "2.75rem",
                          boxShadow: "none",
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          paddingLeft: "0",
                        }),
                      }}
                    />
                  )}
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
              </div>
              {errors.name && <p className="text-[10px] text-destructive font-bold uppercase px-1">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("description")}
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  className="pl-10 h-24 w-full bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all p-3 text-sm focus:outline-none resize-none"
                  placeholder={t("enter_description") || ""}
                  {...register("description")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("cost")} ({t("etb")})
              </Label>
              <div className="relative group">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.cost ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder="e.g. 150.75"
                  {...register("cost")}
                />
              </div>
              {errors.cost && <p className="text-[10px] text-destructive font-bold uppercase px-1">{errors.cost.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("duration")}
              </Label>
              <div className="relative group flex items-center gap-2">
                <div className="relative flex-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.duration ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                    placeholder={t("enter_duration") || ""}
                    {...register("duration")}
                  />
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all px-3 text-sm focus:outline-none disabled:opacity-50"
                >
                  <option value="hour">{t("hour")}</option>
                  <option value="day">{t("day")}</option>
                </select>
              </div>
              {errors.duration && <p className="text-[10px] text-destructive font-bold uppercase px-1">{errors.duration.message}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="rounded-xl px-6">{t("cancel")}</Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? t("updating...") : t("update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

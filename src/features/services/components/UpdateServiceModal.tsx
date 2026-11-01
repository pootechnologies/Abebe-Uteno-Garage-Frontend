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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Briefcase, 
  FileText, 
  Banknote, 
  Clock, 
  Pencil
} from "lucide-react";

const updateServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format")
    .optional(),
  duration: z.string().optional(),
});

type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;

interface UpdateServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: any;
  onSubmit: (updatedData: any) => void;
  formData?: any; // To allow unused props passed from parent ManagedServices
  onInputChange?: any;
  isUpdating?: boolean;
}

export const UpdateServiceModal = ({
  isOpen,
  onOpenChange,
  service,
  onSubmit,
  isUpdating = false,
}: UpdateServiceModalProps) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState("hour");

  const form = useForm<UpdateServiceFormData>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      cost: "",
      duration: "",
    },
  });

  const { register, handleSubmit, reset, formState } = form;
  const { errors } = formState;

  useEffect(() => {
    if (service) {
      const parts = service.duration?.split(" ") || [];
      const numeric = parts[0] || "";
      const extractedUnit = parts[1]?.replace(/s$/, "") || "hour";
      setUnit(extractedUnit);

      reset({
        name: service.name || "",
        description: service.description || "",
        cost: service.cost || "",
        duration: numeric,
      });
    }
  }, [service, reset]);

  const handleFormSubmit = (values: UpdateServiceFormData) => {
    const updatedData: Record<string, unknown> = {
      name: values.name,
      description: values.description,
      cost: values.cost,
    };

    if (values.duration) {
      updatedData.duration = `${values.duration} ${unit}${Number(values.duration) > 1 ? "s" : ""}`;
    }

    onSubmit(updatedData);
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
              {t("update_service")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("name")}
              </Label>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  {...register("name")}
                />
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
                  {...register("description")}
                  placeholder={t("enter_description")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("cost")} (ETB)
              </Label>
              <div className="relative group">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  className={`pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all ${errors.cost ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
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
                    {...register("duration")}
                  />
                </div>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all px-3 text-sm focus:outline-none"
                >
                  <option value="hour">{t("hour")}</option>
                  <option value="day">{t("day")}</option>
                </select>
              </div>
              {errors.duration && <p className="text-[10px] text-destructive font-bold uppercase px-1">{errors.duration.message}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              disabled={isUpdating}
              className="rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex gap-2 items-center justify-center"
            >
              {isUpdating && (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {t("update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// components/AddServiceModal.tsx
import { t } from "i18next";
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
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitService } from "../api/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  cost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format")
    .optional(),
  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^\d+$/, "Must be numeric"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface AddServiceModalProps {
  triggerButton: React.ReactNode;
  onSuccess?: () => void;
}

export default function AddServiceModal({
  triggerButton,
  onSuccess,
}: AddServiceModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState("hour");

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
      toast.success(t("service_submitted_successfully"));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      form.reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error(t("failed_to_submit_service"));
    },
  });

  const onSubmit = (values: ServiceFormData) => {
    const combinedDuration = `${values.duration} ${unit}${
      Number(values.duration) > 1 ? "s" : ""
    }`;

    submitMutation.mutate({
      ...values,
      duration: combinedDuration,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] py-8 px-4 max-w-[900px] sm:px-6 lg:px-8">
        <DialogHeader>
          <DialogTitle>{t("add_service")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input className="p-5" {...field} />
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
                    <FormLabel>{t("cost")} (ETB)</FormLabel>
                    <FormControl>
                      <Input className="p-5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration + Unit */}
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("duration")}</FormLabel>
                    <FormControl>
                      <Input className="p-5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>{t("unit")}</FormLabel>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border rounded p-3"
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
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Input className="p-5 w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md mt-2"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

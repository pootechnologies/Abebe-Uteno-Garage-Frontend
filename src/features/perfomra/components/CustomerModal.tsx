import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().optional(),
  organization: z.string().min(1, "Organization is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  tin_number: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export const CustomerModal = ({ isOpen, onClose, onSubmit }: CustomerModalProps) => {
  const { t } = useTranslation();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organization: "",
      phone: "",
      email: "",
      address: "",
      tin_number: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = (values: FormData) => {
    onSubmit(values);
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-8">
            {t("add_new_customers")}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("customer_name")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("customer_name")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Organization */}
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("organization")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("organization")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Phone_number")}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="e.g. +251912345678"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>{t("address")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("address")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* TIN Number */}
                <FormField
                  control={form.control}
                  name="tin_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tin_number")}</FormLabel>
                      <FormControl>
                        <Input
                          className="p-5"
                          placeholder={t("tin_number")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("saving") : t("submit")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
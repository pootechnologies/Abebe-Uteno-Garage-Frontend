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
import { submitCustomerForm } from "../../customers/api/customer";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  UserCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Fingerprint,
  Plus
} from "lucide-react";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organization: z.string().min(1, "Organization is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  tin_number: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

export const CreateCustomerModal = ({
  isOpen,
  onClose,
  onCustomerCreated,
}: CreateCustomerModalProps) => {
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

  async function onSubmit(values: FormData) {
    try {
      const response = await submitCustomerForm(values);
      if (response) {
        form.reset();
        onClose();
        onCustomerCreated();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error_adding_customer"));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <Plus className="h-5 w-5" />
              </div>
              {t("add_new_customers")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("customer_name")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("customer_name")}
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("organization")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("organization")}
                          {...field}
                        />
                      </div>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("Phone_number")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                        <PhoneInput
                          placeholder="e.g. +251912345678"
                          {...field}
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all w-full"
                        />
                      </div>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </div>
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
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("address")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("address")}
                          {...field}
                        />
                      </div>
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
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("tin_number")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("tin_number")}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-6"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("saving")}
                  </div>
                ) : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

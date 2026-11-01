import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Truck, Building2, Phone, Fingerprint } from "lucide-react";
import { t } from "i18next";
import { submitSuppliers } from "@/features/suppliers/api/supplier.ts";
import { useSubmitLock } from "@/hooks/useSubmitLock"; // ✅ Added

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact_info: z.string().optional(),
  tin_number: z.string().optional(),
});

const AddSupplier = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(supplierSchema),
  });

  const [isSubmitting, lock] = useSubmitLock(); // ✅ useSubmitLock integrated

  const onSubmit = async (data) => {
    await lock(async () => {
      try {
        await submitSuppliers(data);
        reset();
      } catch (error) {
        console.log(error);
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Truck className="h-6 w-6" />
            </div>
            {t("add_supplier")}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("supplier_name")}
              </label>
              <div className="relative group mt-2">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="name"
                  className={`pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full ${
                    errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  placeholder={t("enter_supplier_name")}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 ml-1">{String(errors.name.message)}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact_info"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("contact_information")}
              </label>
              <div className="relative group mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="contact_info"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  placeholder={t("enter_contact_info")}
                  {...register("contact_info")}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tin_number"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
              >
                {t("tin_number")}
              </label>
              <div className="relative group mt-2">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="tin_number"
                  className="pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all block w-full"
                  placeholder={t("enter_supplier_tin")}
                  {...register("tin_number")}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-muted">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("submitting...")}
                </div>
              ) : t("add_supplier")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.ts";
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
import toast from "react-hot-toast";
import { t } from "i18next";
import { Plus, Truck, Building2, Phone } from "lucide-react";

// Zod validation schema
const supplierSchema = z.object({
  name: z.string().min(1, t("enter_supplier_name")),
  contact_info: z
    .string()
    .regex(/^\d{10}$/, t("contact_info_must_ten"))
    .or(z.literal("")), // allows empty string
});

type FormData = z.infer<typeof supplierSchema>;

const AddSupplierModal = ({ isOpen, onClose, onSupplierAdded }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_info: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS}/`,
        data,
        { headers }
      );
      if (response.status === 201 || response.status === 200) {
        toast.success("Supplier added successfully!");
        form.reset();
        onSupplierAdded();
        onClose();
      } else {
        toast.error("Supplier added, but something went wrong.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(
          `Failed to add supplier: ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else {
        toast.error(
          "Failed to add supplier: Network error or server is unavailable."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-xl overflow-hidden w-[90%] sm:w-[450px] animate-in fade-in zoom-in duration-200">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Truck className="h-5 w-5" />
            </div>
            {t("add_supplier")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("supplier_name")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("enter_supplier_name")}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("contact_information")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                          placeholder={t("enter_contact_info")}
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
                onClick={onClose}
                disabled={loading}
                className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl px-6 transition-all active:scale-95"
              >
                {t("close")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> {t("add_supplier")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddSupplierModal;

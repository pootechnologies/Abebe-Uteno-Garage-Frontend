import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/apiConfig.ts";
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
import { Plus, Tags } from "lucide-react";
import { t } from "i18next";

const formSchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

type FormData = z.infer<typeof formSchema>;

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: "",
    },
  });
  
  const [loading, setLoading] = useState(false);

  const accessToken = localStorage.getItem("token");

  // Handle form submission for adding category name
  const onSubmitCategoryName = (data: FormData) => {
    setLoading(true);
    axios
      .post(
        `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}/`,
        {
          name: data.category_name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        toast.success("Category added successfully!");
        form.reset();
        onCategoryAdded();
        onClose();
      })
      .catch((error) => {
        console.error("There was an error adding the category:", error);
        toast.error(error?.response?.data?.name?.[0] || "Failed to add category");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-xl overflow-hidden w-[90%] sm:w-[450px] animate-in fade-in zoom-in duration-200">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Tags className="h-5 w-5" />
            </div>
            {t("add_category")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitCategoryName)} className="p-6 md:p-8">
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    {t("category_name")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                      <Input
                        className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                        placeholder={t("enter_category_name")}
                        autoComplete="off"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Plus className="mr-2 h-4 w-4" /> {t("add_category")}
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

export default AddCategoryModal;

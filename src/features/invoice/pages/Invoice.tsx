import { useEffect, useState } from "react";
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
import Select from "react-select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uniqueInvoiceJobCard } from "../../jobCard/api/jobCard.ts";
import { submitInvoice } from "../api/invoices.ts";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axiosInstance from "@/api/axios.tsx";
import { useSubmitLock } from "@/hooks/useSubmitLock.ts";
import { Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/numberFormaterStats";

// Custom styles for react-select
const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "40px",
    padding: "0.25rem 0.5rem",
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
};

// Zod schema
const paymentSchema = z.object({
  job_card: z.string().min(1, "Please select a Job Card"),
  payment_status: z.enum(["1", "2", "3"]).optional(),
  sub_total: z.coerce.number(),
  vat: z.coerce.number(),
  total_amount: z.coerce.number(),
  paid_amount: z.coerce.number().min(0, "Paid amount cannot be negative"),
});

export default function Invoice() {
  const [isSubmitting, lock] = useSubmitLock();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["jobCards"],
    queryFn: uniqueInvoiceJobCard,
  });

  const jobCards = Array.isArray(data) ? data : [];
  const [selectedJobCardDetails, setSelectedJobCardDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      job_card: "",
      payment_status: "1",
      sub_total: 0,
      vat: 0,
      total_amount: 0,
      paid_amount: 0,
    },
  });

  const fetchJobCardDetails = async (jobCardId: string) => {
    if (!jobCardId) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/garage/jobcard/${jobCardId}`
      );

      setSelectedJobCardDetails(response.data);

      const totalCost = parseFloat(response.data.total_cost || 0);
      const partsTotal = response.data.vehicle_part_requests
        ? parseFloat(response.data.vehicle_part_requests.total_amount || 0)
        : 0;

      const subTotal = totalCost + partsTotal;

      form.setValue("sub_total", subTotal, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      console.error(error);
      toast.error(t("failed_to_fetch_job_card_details"));
    } finally {
      setIsLoading(false);
    }
  };

  const onJobCardChange = (option: any) => {
    const value = option ? option.value : "";
    form.setValue("job_card", value);
    setSelectedJobCardDetails(null);
    fetchJobCardDetails(value);
  };

  useEffect(() => {
    const subTotal = form.getValues("sub_total") || 0;
    const vat = parseFloat((subTotal * 0.15).toFixed(2));
    const total = parseFloat((subTotal + vat).toFixed(2));

    form.setValue("vat", vat);
    form.setValue("total_amount", total);
  }, [form.watch("sub_total")]);

  const onSubmit = async (values: any) => {
    await lock(async () => {
      try {
        const result = await submitInvoice({
          job_card: values.job_card,
          paid_amount: values.paid_amount,
        });

        if (result.status === 200 || result.status === 201) {
          toast.success(t("invoice_submitted_successfully"));
          queryClient.invalidateQueries({ queryKey: ["jobCards"] });
          form.reset();
          setSelectedJobCardDetails(null);
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.job_card?.[0] ||
          t("failed_to_submit_invoice")
        );
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Receipt className="h-6 w-6" />
            </div>
            {t("add_invoice")}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Job Card Select */}
              <FormField
                control={form.control}
                name="job_card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      {t("job_card")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        isClearable
                        isSearchable
                        isDisabled={isLoading}
                        options={jobCards.map((card) => ({
                          label: `${card.id} - ${card.customer_name}`,
                          value: card.id.toString(),
                        }))}
                        value={
                          field.value
                            ? {
                              label: `${field.value} - ${jobCards.find(
                                (c) => c.id.toString() === field.value
                              )?.customer_name || ""
                                }`,
                              value: field.value,
                            }
                            : null
                        }
                        onChange={onJobCardChange}
                        placeholder={t("select_job_card")}
                        styles={{
                          ...customSelectStyles,
                          control: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            borderColor: "var(--border)",
                            "&:hover": { borderColor: "var(--primary)" }
                          }),
                          menu: (base: any) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden"
                          })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Card Details */}
            {selectedJobCardDetails && (
              <div className="p-6 bg-muted/20 dark:bg-muted/10 border border-emerald-500/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                    {t("job_card_details")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("customer_name")}</p>
                    <p className="font-semibold text-foreground mt-1">
                      {selectedJobCardDetails.customer_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("status")}</p>
                    <p className="font-semibold text-foreground mt-1">
                      {selectedJobCardDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("odometer_reading")}</p>
                    <p className="font-semibold text-foreground mt-1">
                      {selectedJobCardDetails.odometer_reading}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("notes")}</p>
                    <p className="font-semibold text-foreground mt-1">
                      {selectedJobCardDetails.notes || t("no_notes")}
                    </p>
                  </div>
                </div>

                {/* Assigned Services Table */}
                {selectedJobCardDetails.assignments?.[0]?.assigned_services?.length > 0 && (
                  <div className="pt-4 border-t border-emerald-500/10">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      {t("assigned_services")}
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-emerald-500/10">
                            <th className="pb-2 pr-4">{t("id")}</th>
                            <th className="pb-2 pr-4">{t("service_name")}</th>
                            <th className="pb-2">{t("price")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJobCardDetails.assignments[0].assigned_services.map((service: any) => (
                            <tr key={service.id} className="border-b border-emerald-500/5">
                              <td className="py-2 pr-4 font-medium">{service.id}</td>
                              <td className="py-2 pr-4 font-medium">{service.service_name}</td>
                              <td className="py-2 font-medium text-emerald-600">
                                ETB {formatCurrency(parseFloat(service.price))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-emerald-500/20">
                            <td colSpan={2} className="py-2 pr-4 text-right font-bold text-sm">
                              {t("total")}:
                            </td>
                            <td className="py-2 font-bold text-emerald-600">
                              ETB {formatCurrency(
                                selectedJobCardDetails.assignments[0].assigned_services
                                  .reduce((sum: number, s: any) => sum + parseFloat(s.price || 0), 0)
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Part Requests */}
            {selectedJobCardDetails?.vehicle_part_requests?.items?.length > 0 && (
              <div className="p-6 bg-muted/20 dark:bg-muted/10 border border-emerald-500/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                    {t("requested_parts")}
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-emerald-500/10">
                        <th className="pb-2 pr-4">{t("id")}</th>
                        <th className="pb-2 pr-4">{t("product_name")}</th>
                        <th className="pb-2 pr-4">{t("part_number")}</th>
                        <th className="pb-2 pr-4">{t("unit_price")}</th>
                        <th className="pb-2 pr-4">{t("quantity")}</th>
                        <th className="pb-2">{t("price")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJobCardDetails.vehicle_part_requests.items.map((item: any) => (
                        <tr key={item.id} className="border-b border-emerald-500/5">
                          <td className="py-2 pr-4 font-medium">{item.id}</td>
                          <td className="py-2 pr-4 font-medium">{item.product_name}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{item.part_number}</td>
                          <td className="py-2 pr-4 font-medium">ETB {formatCurrency(parseFloat(item.unit_price))}</td>
                          <td className="py-2 pr-4 font-medium">{item.quantity}</td>
                          <td className="py-2 font-medium text-emerald-600">
                            ETB {formatCurrency(parseFloat(item.price))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-emerald-500/20">
                        <td colSpan={5} className="py-2 pr-4 text-right font-bold text-sm">
                          {t("total")}:
                        </td>
                        <td className="py-2 font-bold text-emerald-600">
                          ETB {formatCurrency(
                            selectedJobCardDetails.vehicle_part_requests.items
                              .reduce((sum: number, i: any) => sum + parseFloat(i.price || 0), 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Invoice Summary Card */}
            {selectedJobCardDetails && (
              <div className="p-6 bg-muted/20 dark:bg-muted/10 border border-emerald-500/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                    {t("invoice_summary")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sub_total")}</p>
                    <p className="text-lg font-bold  p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-500/10">
                      ETB {formatCurrency(form.watch("sub_total"))}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("vat")} (15%)
                    </p>
                    <p className="text-lg font-bold  p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-500/10">
                      ETB {formatCurrency(form.watch("vat"))}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider ">{t("total_amount")}</p>
                    <p className="text-lg font-bold  p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-500/10">
                      ETB {formatCurrency(form.watch("total_amount"))}
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="paid_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {t("paid_amount")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number" onWheel={(event) => event.currentTarget.blur()}
                            className="h-11 bg-white dark:bg-gray-800 border-emerald-500/20  focus:ring-emerald-500/20 rounded-xl transition-all text-lg font-bold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
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
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

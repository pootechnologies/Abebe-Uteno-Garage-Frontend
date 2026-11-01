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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoiceById, updateInvoice } from "../api/invoices";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  User,
  Car,
  Calendar,
  CreditCard,
  Receipt,
  ArrowLeft,
  FileText,
  ChevronRight,
  ClipboardList,
  Calculator,
  Hash,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

/* -------------------- ZOD SCHEMA -------------------- */
const paymentSchema = z.object({
  paid_amount: z.coerce.number().min(0, "Paid amount cannot be negative"),
  payment_status: z.enum(["Pending", "Paid", "Unpaid"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

/* -------------------- COMPONENT -------------------- */
const InvoiceUpdatePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------- FETCH INVOICE -------------------- */
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery<any>({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    staleTime: 0,
    retry: false
  });

  /* -------------------- FORM -------------------- */
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paid_amount: 0,
      payment_status: "Pending",
    },
  });

  /* -------------------- RESET FORM WITH BACKEND DATA -------------------- */
  useEffect(() => {
    if (invoice) {
        form.reset({
            paid_amount: Number(invoice.paid_amount),
            payment_status: invoice.payment_status as "Pending" | "Paid" | "Unpaid",
        });
    }
  }, [invoice, form]);

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = async (values: PaymentFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: any = {
        payment_status: values.payment_status,
      };

      // Only include paid_amount if payment status is not Paid
      if (values.payment_status !== "Paid" && values.payment_status !== "paid") {
        payload.paid_amount = values.paid_amount;
      }

      await updateInvoice(id!, payload);

      toast.success(t("update_invoice"));

      // Immediately refresh invoice data
      await queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(t("failed_update_invoice"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const DetailItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number | undefined, color?: string }) => (
    <div className="flex items-center space-x-3 p-4 rounded-xl bg-white border border-gray-100 transition-all hover:shadow-sm min-w-0">
        <div className={`p-2.5 rounded-lg shrink-0 ${color || "bg-emerald-50 text-emerald-600"}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight truncate">{label}</span>
            <span className="text-sm font-bold text-gray-900 leading-tight break-words">{value}</span>
        </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return t("N/A");
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading)
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Spinner className="w-10 h-10 text-emerald-600" />
            <p className="text-gray-500 animate-pulse font-medium">{t("loading")}...</p>
        </div>
    );

  if (isError)
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
                <FileText className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t("Oops! Something went wrong")}</h2>
            <p className="text-gray-500">{t("error_loading_invoice")}</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
            </Button>
        </div>
    );

  /* -------------------- JSX -------------------- */
  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate("/manage-invoice")} className="cursor-pointer hover:text-emerald-600 transition-colors font-medium">
                      {t("manage_invoices")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-gray-900">{t("update_invoice")}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center space-x-3 mt-2">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <Receipt className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t("update_invoice")} <span className="text-emerald-600">#{invoice?.id}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Summary Grid */}
        {invoice?.job_card && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailItem 
                    icon={User} 
                    label={t("customer")} 
                    value={invoice.job_card.customer_name} 
                    color="bg-emerald-50 text-emerald-600"
                />
                <DetailItem 
                    icon={Car} 
                    label={t("vehicle")} 
                    value={invoice.job_card.vehicle_info} 
                    color="bg-emerald-50 text-emerald-600"
                />
                <DetailItem 
                    icon={Calendar} 
                    label={t("invoice_date")} 
                    value={formatDate(invoice.invoice_date)} 
                    color="bg-amber-50 text-amber-600"
                />
                <DetailItem 
                    icon={CreditCard} 
                    label={t("total_amount")} 
                    value={`ETB ${parseFloat(invoice.total_amount).toLocaleString()}`} 
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* View-Only Details Card */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <ClipboardList className="w-5 h-5 mr-2 text-emerald-600" />
                            {t("invoice_summary")}
                        </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Hash className="w-4 h-4 mt-1 text-gray-400" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("job_card")}</p>
                                        <p className="text-sm font-bold text-gray-700">#{invoice?.job_card?.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Building2 className="w-4 h-4 mt-1 text-gray-400" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("organization")}</p>
                                        <p className="text-sm font-bold text-gray-700">{invoice?.organization_name || t("N/A")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500">{t("sub_total")}</span>
                                    <span className="text-sm font-bold text-gray-900">ETB {invoice?.sub_total}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500">{t("vat")} (15%)</span>
                                    <span className="text-sm font-bold text-gray-900">ETB {invoice?.vat}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">{t("unpaid_amount")}</span>
                                    <span className="text-sm font-black text-rose-700">ETB {invoice?.unpaid_amount}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Update Payment Form Card */}
            <div>
                <Card className="border-none shadow-lg rounded-2xl overflow-hidden ring-1 ring-emerald-50">
                    <CardHeader className="bg-emerald-600 px-6 py-6">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <Calculator className="w-5 h-5 mr-2" />
                            {t("update_payment")}
                        </h2>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
                                <FormField
                                    control={form.control}
                                    name="payment_status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("payment_status")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <select
                                                        {...field}
                                                        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Paid">Paid</option>
                                                        <option value="Unpaid">Unpaid</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paid_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-tight">{t("paid_amount")}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs ring-0">
                                                        ETB
                                                    </div>
                                                    <Input 
                                                        {...field} 
                                                        type="number" onWheel={(event) => event.currentTarget.blur()} 
                                                        step="0.01" 
                                                        className="h-11 rounded-xl border border-gray-200 pl-12 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || form.getValues("payment_status") === "Paid"} 
                                    className="w-full h-12 text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner className="w-4 h-4 text-white" />
                                            <span>{t("updating")}...</span>
                                        </>
                                    ) : (
                                        <span>{t("update")}</span>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUpdatePage;

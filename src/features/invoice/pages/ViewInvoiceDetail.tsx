import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "@/api/axios.tsx";
import { useTranslation } from "react-i18next";
import { pdf } from "@react-pdf/renderer";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import JobcardReceiptPDF from '@/features/jobCard/components/JobcardReceiptPDF';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    User,
    Car,
    Calendar,
    Gauge,
    CreditCard,
    Clock,
    Wrench,
    Package,
    Receipt,
    ArrowLeft,
    FileText,
    ChevronRight,
    ClipboardList,
    Calculator,
    Building2,
    StickyNote,
    UserCheck,
    ListTodo,
    Hash,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const ViewInvoiceDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const StatusBadge = ({ status }: { status: string }) => {
        const statusColors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            "in progress": "bg-amber-100 text-amber-700 border-amber-200",
            completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
            cancelled: "bg-rose-100 text-rose-700 border-rose-200",
            paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
            unpaid: "bg-rose-100 text-rose-700 border-rose-200",
            partial: "bg-amber-100 text-amber-700 border-amber-200",
        };

        const colorClass = statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${colorClass} capitalize tracking-wider`}>
                {status}
            </span>
        );
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

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axiosInstance.get(`/api/garage/invoices/${id}`);
                setInvoice(response.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };


    const dummyCompany = {
        en_name:
            "Abebe Uteno MOENCO Sub Dealer Annual Vehicle Inspection Center and Garage",
        am_name:
            "አበበ ኡቴኖ ሞኤንኮ ወኪል ዓመታዊ የተሸከርካሪ ምርመራ ጣቢያ እና ጋርዥ",
        // email: "samsonbizuayehu@gmail.com",
        phone: "+251-468932072",
        tin_number: "0001787194",
        vat_number: "3532450014",
        bank_accounts: {},
        country: "Ethiopia",
        region: "South Ethiopia",
        zone: "Wolaita",
        city: "W/Sodo",
        sub_city: "Wolaita Sodo",
        logo: "/media/company/photo_2026-09-08_12-14-01.jpg",
    };

 const handleViewReceipt = async () => {
    if (!invoice) {
        alert("Invoice data is missing.");
        return;
    }

    try {
        const blob = await pdf(
            <JobcardReceiptPDF
                company={dummyCompany}
                customer={invoice}
                vehicle={invoice}
                jobcard_details={invoice.job_card}
                assignments={invoice.job_card?.assignments}
                part_request={invoice.job_card?.vehicle_part_requests}
                totals={{
                    total_amount: invoice.total_amount,
                    vat: invoice.vat,
                    combined_subtotal: invoice.sub_total,
                    service_packages_total: 0,
                    services_total: invoice.job_card?.total_cost || 0,
                    payment_status: invoice.payment_status,
                    paid_amount: invoice.paid_amount,
                    unpaid_amount: invoice.unpaid_amount,
                }}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);

        window.open(url, "_blank");

        // Give the new tab time to load the PDF before
        // releasing the object URL.
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
    } catch (error) {
        console.error("Error generating job card receipt:", error);
        alert("Failed to generate job card receipt.");
    }
};

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Spinner className="w-10 h-10 text-emerald-600" />
                <p className="text-gray-500 animate-pulse font-medium">{t("loading")}...</p>
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
                    <FileText className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t("Oops! Something went wrong")}</h2>
                <p className="text-gray-500">{t("error")}: {error}</p>
                <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
                </Button>
            </div>
        );

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
                                        <BreadcrumbLink onClick={() => navigate("/manage-invoice")} className="cursor-pointer hover:text-emerald-600 transition-colors">
                                            {t("manage_invoices")}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="font-semibold text-gray-900">{t("invoice_details")}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                            <div className="flex items-center space-x-3 mt-2">
                                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {t("invoice")} <span className="text-emerald-600">#{invoice?.id}</span>
                                </h1>
                                {invoice && <StatusBadge status={invoice.payment_status} />}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-gray-200">
                                <ArrowLeft className="w-4 h-4 mr-2" /> {t("back")}
                            </Button>
                            <Button onClick={handleViewReceipt} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 text-white">
                                <FileText className="w-4 h-4 mr-2" /> {t("view_receipt")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Quick Summary Grid */}
                {invoice?.job_card && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <DetailItem
                            icon={User}
                            label={t("customer")}
                            value={invoice.job_card.customer_name}
                            color="bg-emerald-50 text-emerald-600"
                        />
                        <DetailItem
                            icon={User}
                            label={t("organization")}
                            value={invoice.job_card.organization}
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
                            icon={Gauge}
                            label={t("mileage")}
                            value={`${invoice.job_card.odometer_reading?.toLocaleString() || 0} km`}
                            color="bg-rose-50 text-rose-600"
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
                    {/* Main Column - Assignments & Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Card Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <ClipboardList className="w-5 h-5 mr-2 text-emerald-600" />
                                {t("job_card_details")}
                            </h2>
                            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <Hash className="w-4 h-4 mt-1 text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("job_card_id")}</p>
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
                                            <div className="flex items-start space-x-3">
                                                <Activity className="w-4 h-4 mt-1 text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("status")}</p>
                                                    <StatusBadge status={invoice?.job_card?.status || ""} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <Calendar className="w-4 h-4 mt-1 text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("service_date")}</p>
                                                    <p className="text-sm font-bold text-gray-700">{formatDate(invoice?.job_card?.service_date)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Calculator className="w-4 h-4 mt-1 text-gray-400" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("total_service_cost")}</p>
                                                    <p className="text-sm font-bold text-emerald-600">ETB {invoice?.job_card?.total_cost}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {invoice?.job_card?.notes && (
                                        <div className="mt-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                                                <StickyNote className="w-3 h-3 mr-1" />
                                                {t("notes")}
                                            </p>
                                            <p className="text-sm text-gray-600 italic leading-relaxed">"{invoice.job_card.notes}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Assignments Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Wrench className="w-5 h-5 mr-2 text-emerald-600" />
                                    {t("assignments")}
                                </h2>
                                <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                    {invoice?.job_card?.assignments?.length || 0} {t("all_workers")}
                                </span>
                            </div>
                            <div className="space-y-6">
                                {invoice?.job_card?.assignments?.map((assignment: any) => (
                                    <Card key={assignment.id} className="overflow-hidden border-none shadow-sm rounded-2xl transition-all hover:shadow-md">
                                        <header className="bg-gray-50/50 px-6 py-4 border-b flex justify-between items-center text-left">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                                    <UserCheck className="w-5 h-5 text-gray-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("worker")}</p>
                                                    <h4 className="text-sm font-bold text-gray-900">{assignment.worker_name}</h4>
                                                </div>
                                            </div>
                                            <StatusBadge status={assignment.status} />
                                        </header>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="flex items-start space-x-3">
                                                    <Package className="w-4 h-4 mt-1 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("service_package")}</p>
                                                        <p className="text-sm font-bold text-gray-700">{assignment.service_package_name || t("N/A")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3">
                                                    <FileText className="w-4 h-4 mt-1 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("task_description")}</p>
                                                        <p className="text-sm text-gray-600 font-medium">{assignment.task_description || t("N/A")}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {assignment.assigned_services?.length > 0 && (
                                                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                                                        <ListTodo className="w-3.5 h-3.5 mr-2" />
                                                        {t("assigned_services")}
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {assignment.assigned_services.map((service: any) => (
                                                            <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-emerald-200 transition-colors">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`w-2 h-2 rounded-full ${service.status.toLowerCase() === 'completed' ? 'bg-emerald-500' : 'bg-emerald-400 animate-pulse'}`} />
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-800">{service.service_name}</p>
                                                                        <div className="flex items-center text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                            {service.started_at ? new Date(service.started_at).toLocaleString() : t("not_available")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <StatusBadge status={service.status} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column - Part Requests & Invoice Final Summary */}
                    <div className="space-y-8">
                        {/* Parts List Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-emerald-600" />
                                {t("item_list")}
                            </h2>
                            <Card className="border-none shadow-sm rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-50">
                                        {invoice?.job_card?.vehicle_part_requests?.items?.length > 0 ? (
                                            invoice.job_card.vehicle_part_requests.items.map((item: any) => (
                                                <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="text-sm font-bold text-gray-800">{item.product_name}</h5>
                                                            <p className="text-xs text-gray-500 font-bold uppercase">{item.part_number}</p>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-500">x{item.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs text-gray-500 font-bold uppercase">{t("unit")}: ETB {item.unit_price || 0}</p>
                                                        <p className="text-sm font-bold text-emerald-600">ETB {item.price || 0}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <Package className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("no_items_requested")}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Invoice Summary Card */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
                                {t("invoice_summary")}
                            </h2>
                            <Card className="border-none shadow-lg rounded-2xl overflow-hidden ring-1 ring-emerald-50">
                                <CardHeader className="bg-emerald-600 py-6">
                                    <h3 className="text-lg font-bold text-white flex items-center">
                                        <Receipt className="w-5 h-5 mr-2" />
                                        {t("invoice_details")}
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{t("sub_total")}</span>
                                            <span className="font-bold text-gray-900">ETB {invoice?.sub_total}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{t("vat")} (15%)</span>
                                            <span className="font-bold text-gray-900">ETB {invoice?.vat}</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{t("total_amount")}</span>
                                            <span className="text-xl font-black text-emerald-600">ETB {invoice?.total_amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{t("paid_amount")}</span>
                                            <span className="font-bold text-emerald-600">ETB {invoice?.paid_amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">{t("unpaid_amount")}</span>
                                            <span className="font-bold text-rose-600">ETB {invoice?.unpaid_amount}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t flex flex-col items-center">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("payment_status")}</p>
                                            <div className={`w-full text-center py-3 rounded-xl font-black text-sm uppercase tracking-widest border ${invoice?.payment_status?.toLowerCase() === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                : invoice?.payment_status?.toLowerCase() === 'unpaid'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {invoice?.payment_status}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoiceDetail;

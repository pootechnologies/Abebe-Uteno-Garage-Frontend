import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { t } from "i18next";
import axiosInstanceOld from "@/api/axiosOld";
import { Building2 } from "lucide-react";

const CompanyProfile = () => {
    const [formData, setFormData] = useState({
        en_name: "",
        am_name: "",
        owner_en_name: "",
        owner_am_name: "",
        email: "",
        phone1: "",
        phone2: "",
        tin_number: "",
        vat_number: "",
        country: "",
        city: "",
        region: "",
        zone: "",
        sub_city: "",
    });

    const [fetchedData, setFetchedData] = useState(null);
    const [buttonText, setButtonText] = useState("Add");
    const [logoSrc, setLogoSrc] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await axiosInstanceOld.get(
                    API_ENDPOINTS.COMPANY
                );
                const data = response.data[0];

                setFetchedData(data);
                setLogoSrc(data.logo);
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        };

        fetchCompanyData();
    }, []);

    useEffect(() => {
        if (fetchedData) {
            setFormData((prevData) => ({
                ...prevData,
                en_name: fetchedData.en_name || "",
                am_name: fetchedData.am_name || "",
                owner_en_name: fetchedData.owner_en_name || "",
                owner_am_name: fetchedData.owner_am_name || "",
                email: fetchedData.email || "",
                phone1: fetchedData.phone1 || "",
                phone2: fetchedData.phone2 || "",
                tin_number: fetchedData.tin_number || "",
                vat_number: fetchedData.vat_number || "",
                country: fetchedData.country || "",
                city: fetchedData.city || "",
                region: fetchedData.region || "",
                zone: fetchedData.zone || "",
                sub_city: fetchedData.sub_city || "",
            }));

            setButtonText(t("update_information"));
        } else {
            setButtonText("Add");
        }
    }, [fetchedData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "logo" && files) {
            setLogoFile(files[0]);
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        const data = new FormData();

        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });

        if (logoFile) {
            data.append("logo", logoFile);
        }

        try {
            if (fetchedData) {
                await axiosInstanceOld.patch(
                    `${API_ENDPOINTS.COMPANY}${fetchedData.id}`,
                    data,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Company information updated successfully!"
                );
            } else {
                await axiosInstanceOld.post(
                    API_ENDPOINTS.COMPANY,
                    data,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                toast.success(
                    "Company information added successfully!"
                );

                const fetchUpdatedData = async () => {
                    try {
                        const updatedResponse =
                            await axiosInstanceOld.get(
                                API_ENDPOINTS.COMPANY
                            );

                        const updatedData = updatedResponse.data[0];

                        setFetchedData(updatedData);
                        setLogoSrc(updatedData.logo);
                    } catch (error) {
                        console.error(
                            "Error fetching updated company data:",
                            error
                        );
                    }
                };

                await fetchUpdatedData();
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to save company profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
                        <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                            <Building2 className="h-6 w-6" />
                        </div>
                        {t("company_profile")}
                    </h2>
                </div>

                <div className="p-6 md:p-8">
                    <form
                        className="space-y-8"
                        onSubmit={handleSubmit}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* English Name */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="en_name"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    English Name
                                </label>

                                <input
                                    type="text"
                                    id="en_name"
                                    name="en_name"
                                    value={formData.en_name || ""}
                                    onChange={handleChange}
                                    placeholder="Company"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Amharic Name */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="am_name"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    Amharic Name
                                </label>

                                <input
                                    type="text"
                                    id="am_name"
                                    name="am_name"
                                    value={formData.am_name}
                                    onChange={handleChange}
                                    placeholder=""
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Owner English Name */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="owner_en_name"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    Owner English Name
                                </label>

                                <input
                                    type="text"
                                    id="owner_en_name"
                                    name="owner_en_name"
                                    value={formData.owner_en_name}
                                    onChange={handleChange}
                                    placeholder="Owner English Name"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Owner Amharic Name */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="owner_am_name"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    Owner Amharic Name
                                </label>

                                <input
                                    type="text"
                                    id="owner_am_name"
                                    name="owner_am_name"
                                    value={formData.owner_am_name}
                                    onChange={handleChange}
                                    placeholder="Owner Amharic Name"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="email"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("email")}
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@example.com"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Phone 1 */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="phone1"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("phone")} 1
                                </label>

                                <input
                                    type="text"
                                    id="phone1"
                                    name="phone1"
                                    value={formData.phone1}
                                    onChange={handleChange}
                                    placeholder="Primary Phone"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Phone 2 */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="phone2"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("phone")} 2
                                </label>

                                <input
                                    type="text"
                                    id="phone2"
                                    name="phone2"
                                    value={formData.phone2}
                                    onChange={handleChange}
                                    placeholder="Secondary Phone"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* TIN Number */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="tin_number"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("tin_number")}
                                </label>

                                <input
                                    type="text"
                                    id="tin_number"
                                    name="tin_number"
                                    value={formData.tin_number}
                                    onChange={handleChange}
                                    placeholder="TIN Number"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* VAT Number */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="vat_number"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("vat_number")}
                                </label>

                                <input
                                    type="text"
                                    id="vat_number"
                                    name="vat_number"
                                    value={formData.vat_number}
                                    onChange={handleChange}
                                    placeholder="VAT Number"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Country */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="country"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("country")}
                                </label>

                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* City */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="city"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("city")}
                                </label>

                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Region */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="region"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("region")}
                                </label>

                                <input
                                    type="text"
                                    id="region"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    placeholder="Region"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Zone */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="zone"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("zone")}
                                </label>

                                <input
                                    type="text"
                                    id="zone"
                                    name="zone"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    placeholder="Zone"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Sub City */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="sub_city"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("sub_city")}
                                </label>

                                <input
                                    type="text"
                                    id="sub_city"
                                    name="sub_city"
                                    value={formData.sub_city}
                                    onChange={handleChange}
                                    placeholder="Sub City"
                                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none"
                                />
                            </div>

                            {/* Current Logo */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Current Logo
                                </label>

                                {logoSrc && (
                                    <img
                                        src={`https://garage.abebeutenogarage.com${logoSrc}`}
                                        alt="Current Logo"
                                        className="w-32 h-32 object-contain rounded-xl border border-muted-foreground/20"
                                    />
                                )}
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label
                                    htmlFor="logo"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                                >
                                    {t("logo")}
                                </label>

                                <input
                                    type="file"
                                    id="logo"
                                    name="logo"
                                    onChange={handleChange}
                                    className="w-full h-11 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-muted">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Updating..." : buttonText}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
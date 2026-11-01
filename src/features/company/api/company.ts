import axiosInstance from "@/api/axios";
import { toast } from "react-hot-toast";

// Define type for Company
interface Company {
    id?: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    // Add other company fields as needed
}

// Function to fetch company data
export async function getCompanyData() {
    try {
        const response = await axiosInstance.get("api/garage/company/");
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch company data. Please try again.";
        toast.error(message);
        throw error;
    }
}

// Function to update company data
export async function updateCompanyData(company: Partial<Company>) {
    try {
        const response = await axiosInstance.put("api/garage/company/1/", company);
        if (response.status === 200) {
            toast.success("Company data updated successfully!");
            return response.data;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to update company data. Please try again.";
        toast.error(message);
        throw error;
    }
}

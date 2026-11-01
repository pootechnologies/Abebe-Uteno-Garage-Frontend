import axiosInstance from "@/api/axios";
import {toast} from 'react-hot-toast';


export async function submitSuppliers(values) {
    try {
        const response = await axiosInstance.post('/api/garage/suppliers/', values)
        if (response.status === 201) {
            toast.success("Supplier added successfully!");
            return response.data;
        }
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.name?.[0])
    }
}


// Supplier API functions
export async function fetchSuppliers() {
    try {
        const response = await axiosInstance.get('/api/garage/suppliers');
        return response.data.sort((a: any, b: any) => b.id - a.id);
    } catch (error) {
        console.error("There was an error fetching the suppliers:", error);
        toast.error(error?.response?.data?.name?.[0])
        throw error;
    }
}

export async function deleteSupplier(id: number) {
    try {
        await axiosInstance.delete(`/api/garage/suppliers/${id}`);
        toast.success("Supplier deleted successfully!");
        return true;
    } catch (error) {
        console.error("There was an error deleting the supplier:", error);
        toast.error(error?.response?.data?.name?.[0] || "Failed to delete supplier!");
        throw error;
    }
}

export async function updateSupplier(id: number, values: any) {
    try {
        const response = await axiosInstance.patch(`/api/garage/suppliers/${id}`, values);
        toast.success("Supplier updated successfully!");
        return response.data;
    } catch (error) {
        console.error("There was an error updating the supplier:", error);
        toast.error(error?.response?.data?.name?.[0] || "Failed to update supplier!");
        throw error;
    }
}

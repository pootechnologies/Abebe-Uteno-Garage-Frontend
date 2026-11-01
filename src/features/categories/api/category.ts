import axiosInstance from "@/api/axios";
import toast from 'react-hot-toast';

// Function to submit a new Category
export async function submitCategory(values) {
    try {
        const response = await axiosInstance.post("api/garage/category/", values);
        console.log("Response:", response);
        if (response.status === 201) {
            toast.success("Category added successfully!");
            return response.data;
        }
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to submit the form. Please try again.";
        toast.error(error?.response?.data?.name?.[0] || "Unknown error");
        throw error;
    }
}

export const fetchCategories = async () => {
    try {
        const response = await axiosInstance.get("api/garage/category/");
        return response.data.sort((a, b) => b.id - a.id);
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to fetch categories!");
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        await axiosInstance.delete(`api/garage/category/${id}`);
        toast.success("Category deleted successfully!");
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete category!");
        throw error;
    }
};

export const updateCategory = async (id, name) => {
    try {
        const response = await axiosInstance.patch(`api/garage/category/${id}`, { name });
        toast.success("Category updated successfully!");
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to update category!");
        throw error;
    }
};

export const createCategory = async (name) => {
    try {
        const response = await axiosInstance.post("api/garage/category/", { name });
        toast.success("Category created successfully!");
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to create category!");
        throw error;
    }
};

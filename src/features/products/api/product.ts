import axiosInstance from "@/api/axios";
import { toast } from "react-hot-toast";

// Define type for Product
interface Product {
    id?: number;
    name: string;
    unit: string | null;
    selling_price: number;
    stock: number;
    part_number?: string | null;
    description?: string | null;
    buying_price?: number;
    receipt_no?: string | null;
    image?: string | null;
    user?: string;
    // piece?: number;
    // package?: number;
}

export interface ProductSearchResult {
    id: number;
    name: string;
    part_number: string | null;
    selling_price: string | number;
    stock: number;
}

export interface ProductListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
    all_results: ProductSearchResult[];
}

// Function to fetch paginated products
export async function getProducts(page: number = 1) {
    try {
        const response = await axiosInstance.get(
            "api/garage/products/?include_all=True",
            {
                params: {
                    page,
                },
            }
        );

        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch products. Please try again.";

        toast.error(message);
        throw error;
    }
}

// Function to fetch a single product by ID
export async function getProductById(id: number) {
    try {
        const response = await axiosInstance.get(
            `api/garage/products/${id}/`
        );

        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch the product. Please try again.";

        toast.error(message);
        throw error;
    }
}

// Function to create a new product
export async function createProduct(
    product: Omit<Product, "id">
) {
    try {
        const response = await axiosInstance.post(
            "api/garage/products/",
            product
        );

        if (response.status === 201) {
            toast.success("Product created successfully!");
            return response.data;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to create the product. Please try again.";

        toast.error(message);
        throw error;
    }
}

// Function to update an existing product
export async function updateProduct(
    id: number,
    product: Partial<Product>
) {
    try {
        const response = await axiosInstance.put(
            `api/garage/products/${id}/`,
            product
        );

        if (response.status === 200) {
            toast.success("Product updated successfully!");
            return response.data;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to update the product. Please try again.";

        toast.error(message);
        throw error;
    }
}

// Function to delete a product
export async function deleteProduct(id: number) {
    try {
        const response = await axiosInstance.delete(
            `api/garage/products/${id}`
        );

        if (response.status === 204) {
            toast.success("Product deleted successfully!");
            return true;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete the product. Please try again.";

        toast.error(message);
        throw error;
    }
}
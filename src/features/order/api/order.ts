import axiosInstance from "@/api/axios";
import { toast } from "react-hot-toast";

// Define types for Order and OrderItem
interface OrderItem {
    product: number;
    quantity: number;
    package?: number;
    unit_price: number;
    unit: string;
    price: number;
}

interface Order {
    customer?: number;
    total_amount: string;
    phone_number: string;
    tin_number: string;
    fs_number: string;
    receipt: string;
    items: OrderItem[];
}

// Function to submit a new order
export async function submitOrderForm(order: Order) {
    try {
        const response = await axiosInstance.post("api/garage/orders/", order);
        if (response.status === 201) {
            return response.data;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to submit the order. Please try again.";
        toast.error(message);
        throw error;
    }
}

// Function to fetch all orders
export async function getOrders() {
    try {
        const response = await axiosInstance.get("api/garage/orders/");
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch orders. Please try again.";
        toast.error(message);
        throw error;
    }
}

// Function to fetch a single order by ID
export async function getOrderById(id: number) {
    try {
        const response = await axiosInstance.get(`api/garage/orders/${id}/`);
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch the order. Please try again.";
        toast.error(message);
        throw error;
    }
}

// Function to update an existing order
export async function updateOrder(id: number, order: Partial<Order>) {
    try {
        const response = await axiosInstance.put(`api/garage/orders/${id}/`, order);
        if (response.status === 200) {
            toast.success("Order updated successfully!");
            return response.data;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to update the order. Please try again.";
        toast.error(message);
        throw error;
    }
}

// Function to delete an order
export async function deleteOrder(id: number) {
    try {
        const response = await axiosInstance.delete(`api/garage/orders/${id}/`);
        if (response.status === 204) {
            toast.success("Order deleted successfully!");
            return true;
        }
    } catch (error: any) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete the order. Please try again.";
        toast.error(message);
        throw error;
    }
}

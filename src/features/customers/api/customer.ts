import axiosInstance from "@/api/axios";
import { toast } from "react-hot-toast";

// Function to submit a new customer
export async function submitCustomerForm(values: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}) {
  try {
    const response = await axiosInstance.post("api/garage/customers/", values);
    console.log("Response:", response);
    if (response.status === 201) {
      toast.success("Customer added successfully!");
      return response.data;
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to submit the form. Please try again.";
    toast.error(message);
    throw error;
  }
}

// api/customer.ts
// api/customer.ts
export async function getCustomers(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
) {
  try {
    const response = await axiosInstance.get("api/garage/customers/", {
      params: { page, page_size: pageSize, search: searchTerm },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch customers. Please try again.";
    toast.error(message);
    throw error;
  }
}


export async function getAllCustomers() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch customers. Please try again.";
    toast.error(message);
    throw error;
  }
}

// api/customer.ts
export async function getCustomersForVehicle() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch customers. Please try again.";
    toast.error(message);
    throw error;
  }
}



// Function to update an existing customer
export async function updateCustomer(
  id: number,
  values: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
) {
  try {
    const response = await axiosInstance.put(
      `api/garage/customers/${id}/`,
      values
    );
    if (response.status === 200) {
      // toast.success("Customer updated successfully!");
      return response.data;
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update the customer. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to delete a customer
export async function deleteCustomer(id: number) {
  try {
    const response = await axiosInstance.delete(`api/garage/customers/${id}/`);
    if (response.status === 204) {
      return true;
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete the customer. Please try again.";
    toast.error(message);
    throw error;
  }
}

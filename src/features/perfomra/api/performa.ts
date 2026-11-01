import axiosInstance from "@/api/axios";
import { toast } from "react-hot-toast";

interface PerformaItem {
  product: string;
  quantity: number;
  unit: string;
  unit_price: string;
}

interface PerformaData {
  customer: number | null;
  performas: {
    receipt: string;
    products: PerformaItem[];
  }[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  tin_number: string;
  fs_number: string;
}

interface Company {
  name: string;
  am_name: string;
  phone1: string;
  phone2: string;
  tin_number: string;
  logo: string;
}

interface NewCustomer {
  name: string;
  phone: string;
  tin_number: string;
  vat_number: string;
  zone: string;
  city: string;
  sub_city: string;
}

// Function to fetch company data
export async function fetchCompanyData(): Promise<Company> {
  try {
    const response = await axiosInstance.get("api/garage/company/");
    return response.data[0];
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch company data. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to fetch customers
export async function fetchCustomers(): Promise<Customer[]> {
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

// Function to add a new customer
export async function addCustomer(customer: NewCustomer): Promise<Customer> {
  try {
    const response = await axiosInstance.post(
      "api/garage/customers/",
      customer
    );
    if (response.status === 201) {
      toast.success("Customer added successfully!");
      return response.data;
    } else {
      toast.error("Failed to add customer.");
      throw new Error("Failed to add customer.");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to add customer. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to submit performa
export async function submitPerforma(
  performaData: PerformaData
): Promise<number> {
  try {
    const response = await axiosInstance.post(
      "api/garage/performa-customers/",
      performaData
    );
    if (response.status === 201) {
      toast.success("Performa submitted successfully!");
      return response.data.id;
    } else {
      toast.error("Failed to submit performa.");
      throw new Error("Failed to submit performa.");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to submit performa. Please try again.";
    toast.error(error?.response?.data?.customer);
    throw error;
  }
}

// api/performaCustomers.ts
// api/performaCustomers.ts
export async function fetchPerformaCustomers(
  page: number = 1,
  search?: string
) {
  try {
    // Build URL dynamically
    let url = `api/garage/performa-customers/?page=${page}`;
    if (search && search !== "all") {
      url += `&search="${search}"`; // pass as ?search="value"
    }

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch performa customers. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to delete a performa customer
export async function deletePerformaCustomer(id: number) {
  try {
    const response = await axiosInstance.delete(
      `api/garage/performa-customers/${id}`
    );
    if (response.status === 204) {
      toast.success("Performa customer deleted successfully!");
      return true;
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete performa customer. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to fetch a performa customer by ID
export async function fetchPerformaCustomerById(id: number) {
  try {
    const response = await axiosInstance.get(
      `api/garage/performa-customers/${id}`
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch performa customer details. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to fetch a performa customer by ID
export async function fetchPerformaCustomerByIdd(id: number) {
  try {
    const response = await axiosInstance.get(
      `api/garage/performa-customers/${id}`
    );
    return response.data.results;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch performa customer details. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to fetch a performa customer by ID
export async function fetchPerformaPrdouctById(id: number) {
  try {
    const response = await axiosInstance.get(
      `api/garage/performa-products/${id}`
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch performa customer details. Please try again.";
    toast.error(message);
    throw error;
  }
}

// Function to update a performa customer
export async function updatePerformaCustomer(id: number, performaData: any) {
  try {
    const response = await axiosInstance.put(
      `api/garage/performa-customers/${id}`,
      performaData
    );
    if (response.status === 200) {
      toast.success("Performa customer updated successfully!");
      return response.data;
    } else {
      toast.error("Failed to update performa customer.");
      throw new Error("Failed to update performa customer.");
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update performa customer. Please try again.";
    toast.error(message);
    throw error;
  }
}

import axiosInstance from "@/api/axios";

// Function to submit a part request
export async function submitVehiclePartRequest(values: any) {
  try {
    const response = await axiosInstance.post('api/garage/partrequest/', values);
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}

// Function to fetch part requests
export async function getPartRequests(search: string = "", page: number = 1) {
  try {
    const response = await axiosInstance.get('api/garage/partrequest/', { params: { search, page } });
    return response.data;
  } catch (error) {
    console.error('Error fetching part requests:', error);
    throw error;
  }
}


// Function to get All customers

export async function getAllCustomers() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results; // { count: number, results: Customer[], next: string | null, previous: string | null }
  } catch (error: any) {
    throw error;
  }
}



// Function to update a part request

export async function updatePartRequest({ id, ...values }: { id: number;[key: string]: any; }) {
  try {
    const response = await axiosInstance.patch(`api/garage/partrequest/${id}/`, values);
    return response.data;
  } catch (error) {
    console.error('Error updating part request:', error);
    throw error;
  }
}

// Function to delete a part request
export async function deletePartRequest(id: number) {
  try {
    const response = await axiosInstance.delete(`api/garage/partrequest/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting part request:', error);
    throw error;
  }
}


// get products


export async function getProducts() {
  try {
    const response = await axiosInstance.get('api/garage/products/');
    return response.data;
  } catch (error) {
    console.error('Error fetching part requests:', error);
    throw error;
  }
}


// Fetch job cards
export const getJobCards = async () => {
  const response = await axiosInstance.get('api/garage/jobcard/');
  return response.data;
};

// import { getPartRequestById, updatePartRequest } from "@/features/VehiclePartRequest/api/vehiclePartRequest";


// Fetch part request by id

export const getPartRequestById = async (id: number) => {
  const response = await axiosInstance.get(`api/garage/partrequest/${id}`);
  return response.data
}

// Function to update a part request

export async function updateOrderVouchers({ id, ...values }: { id: number;[key: string]: any }) {
  try {
    const response = await axiosInstance.patch(`api/garage/partrequest/${id}/`, values);
    return response.data;
  } catch (error) {
    console.error('Error updating part request:', error);
    throw error;
  }
}

import axiosInstance from "@/api/axios.tsx";

// Function to submit a part request
export async function submitVehicleOldPart(values: any) {
  try {
    const response = await axiosInstance.post('api/garage/oldpart/', values);
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
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


export async function getOldPart(page: number = 1, search: string = "") {
  try {
    const response = await axiosInstance.get('api/garage/oldpart/', {
      params: { page, search }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching old parts:', error);
    throw error;
  }
}


export async function getOldPartById(id: string) {
  try {
    const response = await axiosInstance.get(`api/garage/oldpart/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching part request details:', error);
    throw error;
  }
}

// Function to update a part request

export async function updateOldPart({ id, ...values }: { id: number; [key: string]: any }) {
  try {
    const response = await axiosInstance.patch(`api/garage/oldpart/${id}/`, values);
    return response.data;
  } catch (error) {
    console.error('Error updating part request:', error);
    throw error;
  }
}

// Function to delete a part request
export async function deleteOldPart(id: number, p0: { onSuccess: () => void; onError: () => void; }) {
  try {
    const response = await axiosInstance.delete(`api/garage/oldpart/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting part request:', error);
    throw error;
  }
}





// Update an existing vehicle old part delivery
export const updateVehicleOldPart = async (id: string, data: any) => {
  const response = await axiosInstance.patch(`/api/garage/oldpart/${id}/`, data);
  return response.data;
};

// Fetch a single vehicle old part delivery by ID
export const fetchVehicleOldPartById = async (id: string) => {
  const response = await axiosInstance.get(`/api/garage/oldpart/${id}/`);
  return response.data;
};
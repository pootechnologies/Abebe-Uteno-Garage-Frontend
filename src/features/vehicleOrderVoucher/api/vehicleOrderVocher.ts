import axiosInstance from "@/api/axios";

// Function to submit a part request
export async function submitVehicleOrderVoucher(values: any) {
  try {
    const response = await axiosInstance.post('api/garage/ordervoucher/', values);
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
}

// Function to fetch part requests
// api/vehicleOrderVocher.ts
export async function getOrderVouchers(page: number, search: string = "") {
  try {
    const response = await axiosInstance.get('api/garage/ordervoucher', {
      params: { page, search }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


// Function to get All customers

export async function getAllCustomers() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results; // { count: number, results: Customer[], next: string | null, previous: string | null }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch customers. Please try again.";
    toast.error(message);
    throw error;
  }
}


// Function to get single

export async function getOrderVouchersById(id: string) {
  try {
    const response = await axiosInstance.get(`api/garage/ordervoucher/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching part request details:', error);
    throw error;
  }
}


// Function to update a order voucher

export async function updateOrderVouchers({ id, ...values }: { id: number;[key: string]: any }) {
  try {
    const response = await axiosInstance.patch(`api/garage/ordervoucher/${id}/`, values);
    return response.data;
  } catch (error) {
    console.error('Error updating part request:', error);
    throw error;
  }
}


// // Function to update a part request

// export async function updateOrderVoucher({ id, ...values }: { id: number; [key: string]: any }) {
//   try {
//     const response = await axiosInstance.patch(`api/garage/ordervoucher${id}/`, values);
//     return response.data;
//   } catch (error) {
//     console.error('Error updating part request:', error);
//     throw error;
//   }
// }

// Function to delete a part request
export async function deleteOrderVoucher(id: number) {
  try {
    const response = await axiosInstance.delete(`api/garage/ordervoucher/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting part request:', error);
    throw error;
  }
}




export const fetchVehicleOrderVoucherById = async (id: string) => {
  const response = await axiosInstance.get(`/api/garage/ordervoucher/${id}/`);
  return response.data;
};

export const updateVehicleOrderVoucher = async (id: string, data: any) => {
  const response = await axiosInstance.patch(`/api/garage/ordervoucher/${id}/`, data);
  return response.data;
};
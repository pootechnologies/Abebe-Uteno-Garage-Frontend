import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

// Function to fetch services
export const getServices = async (search?: string = "", page?: number) => {
  try {
    const params: any = {};
    if (search) params.search = search;
    if (page) params.page = page;

    const response = await axiosInstance.get('api/garage/services/', {
      params,
    });
    return response?.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch services.";
    toast.error(message);
    throw error;
  }
};

// Function to fetch services
export const allgetServices = async () => {
  try {
    const response = await axiosInstance.get('api/garage/services/', {
      params: { include_all: true },
    });
    return response?.data?.all_results;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch services.";
    toast.error(message);
    throw error;
  }
};


// Function to submit a new service
export const submitService = async (serviceData: { name: string; description?: string; cost?: string; duration?: string }) => {
  try {
    const response = await axiosInstance.post('api/garage/services/', serviceData);
    console.log("Service submitted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to submit service.";
    toast.error(message);
    throw error;
  }
};

// Function to update an existing service
export const updateService = async (serviceId: number, serviceData: { name?: string; description?: string; cost?: string; duration?: string }) => {
  try {
    console.log(serviceId);
    console.log(serviceData); // Add this line to check if serviceData is being passed correctly
    const response = await axiosInstance.put(`api/garage/services/${serviceId}/`, serviceData);
    return response.data;
  } catch (error: any) {
    ;
    throw error;
  }
};

// Function to delete a service
export const deleteService = async (serviceId: number) => {
  try {
    const response = await axiosInstance.delete(`api/garage/services/${serviceId}/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

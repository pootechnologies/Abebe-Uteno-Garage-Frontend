import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from "@/api/axios";
import { toast } from 'react-hot-toast';

// Function to submit a new vehicle
const submitVehicle = async (vehicleData: {
  license_plate: string;
  motor_kutir: string;
  shanci_kutir: string;
  model: string;
  year: number;
  color: string;
  image?: File;
  user?: string;
  customer?: string;
}) => {
  const formData = new FormData();
  Object.entries(vehicleData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  const response = await axiosInstance.post('/api/garage/vehicles/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Function to update an existing vehicle
const updateVehicle = async ({ id, ...vehicleData }: { id: number } & {
  license_plate: string;
  motor_kutir: string;
  shanci_kutir: string;
  model: string;
  year: number;
  color: string;
  image?: File | string;
  user?: string;
  customer?: string;
}) => {
  const formData = new FormData();
  // Append all fields except 'image' first
  Object.entries(vehicleData).forEach(([key, value]) => {
    if (key !== 'image' && value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  // Handle image separately (File object or skip if not provided)
  if (vehicleData.image instanceof File) {
    formData.append('image', vehicleData.image);
  }
  const response = await axiosInstance.put(`/api/garage/vehicles/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Function to delete a vehicle
const deleteVehicle = async (vehicleId: number) => {
  const response = await axiosInstance.delete(`/api/garage/vehicles/${vehicleId}/`);
  return response.data;
};

// Custom hook for submitting a new vehicle
export const useSubmitVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitVehicle,
    onSuccess: () => {
      toast.success("Vehicle submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to submit vehicle.";
      toast.error(message);
    },
  });
};

// Custom hook for updating a vehicle
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      toast.success("Vehicle updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update vehicle.";
      toast.error(message);
    },
  });
};

// Custom hook for deleting a vehicle
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      toast.success("Vehicle deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to delete vehicle.";
      toast.error(message);
    },
  });
};

// Function to fetch vehicles
export async function getVehicles(page: number = 1, pageSize: number = 10, search: string = "") {
  try {
    const response = await axiosInstance.get("/api/garage/vehicles/", {
      params: { page, page_size: pageSize, search }
    });
    return response?.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch vehicles. Please try again.";
    toast.error(message);
    throw error;
  }
};


export async function getAllVehicles() {
  try {
    const response = await axiosInstance.get("/api/garage/vehicles/?include_all=true");
    return response?.data?.all_results;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch vehicles. Please try again.";
    toast.error(message);
    throw error;
  }
}
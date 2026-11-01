// api/servicePackage.ts
import axiosInstance from '@/api/axios';

// Function to fetch service packages
export const getServicePackages = async () => {
  try {
    const response = await axiosInstance.get('api/garage/servicepackages/');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Function to submit a new service package
export const submitServicePackage = async (servicePackageData: {
  name: string;
  services: string[];
  flat_rate?: string;
}) => {
  try {
    const response = await axiosInstance.post('api/garage/servicepackages/', servicePackageData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Function to update an existing service package
export const updateServicePackage = async (servicePackageId: number, servicePackageData: {
  name: string;
  services: string[];
  flat_rate?: string;
}) => {
  try {
    const response = await axiosInstance.patch(`api/garage/servicepackages/${servicePackageId}/`, servicePackageData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Function to delete a service package
export const deleteServicePackage = async (servicePackageId: number) => {
  try {
    const response = await axiosInstance.delete(`api/garage/servicepackages/${servicePackageId}/`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

import axiosInstance from "@/api/axios.tsx";

// Define interfaces
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CustomerData {
  id: number;
  name: string;
  phone: string;
  tin_number: string;
  email: string;
  organization: string;
  address: string;
  user: string;
}

interface VehicleData {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  customer: number;
}

interface ServicePackageData {
  id: number;
  name: string;
  description: string;
  cost: string;
  duration: number | null;
}

interface ServiceData {
  id: number;
  name: string;
  description: string | null;
  cost: string;
  duration: string;
}

export interface AssignedService {
  id: number;
  service: number;
  service_name: string;
  status: string;
  completed_at: string | null;
}

export interface Assignment {
  id: number;
  worker: number;
  worker_name: string;
  job_card: number;
  status: string;
  service_package: number | null;
  task_description: string;
  assigned_services: AssignedService[];
}

export interface JobCardDetails {
  id: number;
  customer_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  status: string;
  service_date: string;
  odometer_reading: number | null;
  total_cost: string;
  user: string;
}

// Fetch user data
export const fetchUserData = async (): Promise<UserData[]> => {
  const response = await axiosInstance.get("auth/user/");
  return response.data;
};

// Fetch customer data
export const fetchCustomerData = async (): Promise<CustomerData[]> => {
  const response = await axiosInstance.get("api/garage/customers/?include_all=True");
  return response?.data?.all_results;
};

// Fetch vehicle data
export const fetchVehicleData = async (): Promise<VehicleData[]> => {
  const response = await axiosInstance.get("api/garage/vehicles/");
  return response?.data?.results;
};

// Fetch service package data
export const fetchServicePackageData = async (): Promise<
  ServicePackageData[]
> => {
  const response = await axiosInstance.get("api/garage/servicepackages/");
  return response.data;
};

// Fetch service data
export const fetchServiceData = async (): Promise<ServiceData[]> => {
  const response = await axiosInstance.get("api/garage/services/?include_all=True");
  return response?.data?.all_results;
};

export const getJobCards = async (
  page: number = 1,
  search: string = ""
): Promise<{
  count: number;
  results: JobCardDetails[];
  next: string | null;
  previous: string | null;
}> => {
  const params: any = { page };
  if (search) {
    params.search = search; // Only add search param if it's not empty
  }
  const response = await axiosInstance.get(`api/garage/jobcard/`, { params });
  return response.data;
};


export const getJobCardsSelect = async (): Promise<{
  count: number;
  results: JobCardDetails[];
  next: string | null;
  previous: string | null;
}> => {
  const response = await axiosInstance.get(
    `api/garage/jobcard?include_all=True`
  );
  return response.data.all_results;
};


// Fetch all customers

export async function getAllCustomers() {
  try {
    const response = await axiosInstance.get("api/garage/customers/?include_all=True");
    return response?.data?.all_results; // { count: number, results: Customer[], next: string | null, previous: string | null }
  } catch (error: any) {
    throw error;
  }
}

export const uniqueInvoiceJobCard = async () => {
  const response = await axiosInstance.get(
    `api/garage/available-jobcard-invoice/`
  );
  return response.data;
};

// Fetch job card details by id
export const fetchJobCardDetails = async (
  id: string
): Promise<JobCardDetails> => {
  const response = await axiosInstance.get(`/api/garage/jobcard/${id}/`);
  return response.data;
};

// Submit combined job card data
export const submitCombinedJobCard = async (jobCardData: any) => {
  const response = await axiosInstance.post("api/garage/jobcard/", jobCardData);
  return response.data;
};

// Update job card details
export const updateJobCardDetails = async (
  id: string,
  jobCardDetails: JobCardDetails
): Promise<void> => {
  await axiosInstance.put(`/api/garage/jobcard/${id}/`, jobCardDetails);
};

// Delete a job card
export const deleteJobCard = async (id: number): Promise<void> => {
  await axiosInstance.delete(`api/garage/jobcard/${id}/`);
};

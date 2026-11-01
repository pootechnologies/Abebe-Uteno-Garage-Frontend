import axiosInstance from "@/api/axios";

export const fetchTasks = async () => {
  const response = await axiosInstance.get("api/garage/my-assignments/");
  return response.data;
};

export const updateAssignedService = async (
  jobId: number,
  serviceId: number,
  newStatus: string
) => {
  const response = await axiosInstance.patch(
    `api/garage/my-assignments/${jobId}/services/${serviceId}/`,
    { status: newStatus }
  );
  return response.data;
};

export const updateServicePackage = async (
  jobId: number,
  newStatus: string
) => {
  const response = await axiosInstance.patch(
    `api/garage/my-assignments/${jobId}/package/`,
    { package_status: newStatus }
  );
  return response.data;
};

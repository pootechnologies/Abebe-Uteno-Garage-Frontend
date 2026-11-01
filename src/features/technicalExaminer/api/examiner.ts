import axiosInstance from "@/api/axios";

export const fetchAssignments = async () => {
  const response = await axiosInstance.get("api/garage/jobcardassignment/");
  return response.data;
};

export const updateAssignedService = async (
  jobId: number,
  newStatus: string,
) => {
  const response = await axiosInstance.patch(
    `api/garage/jobcardassignment/${jobId}/verify/`,
    { status: newStatus },
  );
  return response.data;
};

export const updateSingleAssignedService = async (
  serviceId: number,
  newStatus: string,
) => {
  const response = await axiosInstance.patch(
    `api/garage/examiner/assigned-services/${serviceId}/`,
    { status: newStatus },
  );
  return response.data;
};

/* ✅ NEW FUNCTION FOR SERVICE PACKAGE STATUS */
export const updateServicePackageStatus = async (
  jobId: number,
  newStatus: string,
) => {
  const response = await axiosInstance.patch(
    `api/garage/examiner/assigned-services-package/${jobId}/`,
    { package_status: newStatus },
  );
  return response.data;
};
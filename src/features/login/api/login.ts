import axiosInstance from "@/api/axios";

interface LoginResponse {
  token: string;
  // Add other fields as necessary
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log(email,password)
  const response = await axiosInstance.post<LoginResponse>('/api/token/', {
    email,
    password,
  });
  return response.data;
};

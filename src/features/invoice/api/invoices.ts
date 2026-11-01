import axiosInstance from "@/api/axios.tsx";

// Function to submit invoice
export const submitInvoice = async (invoiceData) => {
    const response = await axiosInstance.post('/api/garage/invoices/', invoiceData);
    return response;
};

// Function to get invoice

// Function to get invoice (with pagination)
export const getInvoice = async (page: number = 1, search: string = "") => {
  let url = `/api/garage/invoices/?page=${page}`;
  if (search && search.trim() !== "") {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

// Function to delete invoice by ID
export const deleteInvoice = async (id) => {
    const response = await axiosInstance.delete(`/api/garage/invoices/${id}/`);
    return response.data;
};

// Function to get invoice by ID
export const getInvoiceById = async (id) => {
    const response = await axiosInstance.get(`/api/garage/invoices/${id}/`);
    return response.data;
};

// Function to update invoice by ID
export const updateInvoice = async (id, invoiceData) => {
    const response = await axiosInstance.patch(`/api/garage/invoices/${id}/`, invoiceData);
    return response.data;
};
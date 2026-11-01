import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { setupInterceptors } from './interceptors';

const axiosInstanceOld: AxiosInstance = axios.create({
  baseURL: 'https://abebegarage-api.pootechnologies.tech/api/garage', // Same or different base URL
  timeout: 30000,
});

// Apply the same interceptors
setupInterceptors(axiosInstanceOld);

export default axiosInstanceOld;

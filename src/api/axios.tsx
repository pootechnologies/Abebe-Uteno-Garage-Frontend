import type {AxiosInstance} from 'axios';
import axios from 'axios';
import {setupInterceptors} from './interceptors';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: 'https://abebegarage-api.pootechnologies.tech/', // Replace with your real base URL
    timeout: 30000,
});

setupInterceptors(axiosInstance);

export default axiosInstance;

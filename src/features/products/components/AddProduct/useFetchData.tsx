import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/apiConfig.ts";

const useFetchData = (endpoint, setter, mapper) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        setter(response.data.map(mapper));
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData();
  }, [endpoint, setter, mapper]);
};

export default useFetchData;

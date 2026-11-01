import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/apiConfig.ts";

const useFetchData = (endpoint, setter) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve access_token from localStorage
        const accessToken = localStorage.getItem("token");

        // Prepare headers with the access_token
        const headers = {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        };

        // Make the API request with the access token in headers
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers,
        });

        // Update the state with the response data
        setter(response.data);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData();
  }, [endpoint, setter]);
};

export default useFetchData;

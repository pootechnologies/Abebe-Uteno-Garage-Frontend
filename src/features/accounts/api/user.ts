// api/userApi.js
import axiosInstance from "@/api/axios"; // Ensure this is the path to your Axios instance

interface UserData {
    name: string;
    email: string;
    password: string;
    re_password: string;
    role: string;
}

// Function to fetch data from the API
export const fetchUsers = async () => {
    try {
        const response = await axiosInstance.get('/auth/user/');
        return response.data; // Return the data from the response
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error; // Throw the error to handle it in the component if needed
    }
};

export const fetchUserProfile = async () => {
    try {
        const response = await axiosInstance.get('/auth/user/profile/');
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

// Function to add data user account
export const addUser = async (userData: UserData) => {
    try {
        const response = await axiosInstance.post('/auth/user/', userData);
        return response.data;
    } catch (error) {
        console.error("Error adding user:", error);
        throw error; // Re-throw the error to handle it in the component
    }
};

// Function to update user data using PUT
export const updateUser = async (id: number, userData: Partial<UserData>) => {
    try {
        const response = await axiosInstance.put(`/auth/user/${id}/`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error; // Re-throw the error to handle it in the component
    }
};

// Alternatively, if you prefer to use PATCH for partial updates
export const patchUpdateUser = async (id: number, userData: Partial<UserData>) => {
    try {
        const response = await axiosInstance.patch(`/auth/user/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error patching user:", error);
        throw error; // Re-throw the error to handle it in the component
    }
};


// Function to delete a user
export const deleteUser = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/auth/user/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error; // Re-throw the error to handle it in the component
    }
};


// add role function

// Function to add data user account
export const addRole = async (userData: UserData) => {
    try {
        const response = await axiosInstance.post('/auth/user/role/', userData);
        return response.data;
    } catch (error) {
        console.error("Error adding user:", error);
        throw error; // Re-throw the error to handle it in the component
    }
};
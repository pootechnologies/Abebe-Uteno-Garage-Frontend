import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of the user data
interface User {
    email: string;
    name: string;
    role: string;
}

// Define the shape of the store
interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

// Create the store with persist middleware
const useUserStore = create(
    persist<UserStore>(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage', // Unique name for the storage
            storage: createJSONStorage(() => localStorage), // Use localStorage as the storage mechanism
        }
    )
);

export default useUserStore;

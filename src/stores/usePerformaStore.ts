import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePerformaStore = create(
    persist(
        (set) => ({
            selectedCustomerPerforma: null,
            setSelectedCustomerPerforma: (customPerforma) =>
                set({ selectedCustomerPerforma: customPerforma }),
        }),
        {
            name: 'selected-customer-performa', // key in localStorage
        }
    )
);

export default usePerformaStore
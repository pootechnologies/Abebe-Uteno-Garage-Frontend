// useCustomerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCustomerStore = create(persist((set) => ({
    selectedCustomer: null,
    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
})));

export default useCustomerStore;

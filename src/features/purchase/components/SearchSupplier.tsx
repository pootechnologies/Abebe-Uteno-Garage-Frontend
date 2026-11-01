import React, { useState, useEffect, useMemo } from "react";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import Select from "react-select";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";

const SearchSupplier = React.memo(({ onSupplierSelect }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstanceOld.get(API_ENDPOINTS.SUPPLIERS);

        if (isMounted) {
          setSuppliers(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load suppliers");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSuppliers();

    return () => {
      isMounted = false;
    };
  }, []);

  const supplierOptions = useMemo(() => {
    return [
      ...suppliers.map((supplier) => ({
        value: supplier.name,
        label: supplier.name,
      })),
    ];
  }, [suppliers]);

  const handleChange = (selectedOption) => {
    onSupplierSelect(selectedOption);
  };

  return (
    <div className="ml-4 w-[80%] md:w-64">
      <Select
        isClearable
        isLoading={isLoading}
        options={supplierOptions}
        placeholder="Search suppliers..."
        onChange={handleChange}
        classNamePrefix="react-select"
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default SearchSupplier;

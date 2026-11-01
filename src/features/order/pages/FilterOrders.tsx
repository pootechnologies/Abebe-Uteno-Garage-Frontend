import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.js";
import { formatCurrency } from "@/utils/numberFormaterStats";
import Pagination from "@mui/material/Pagination";
import { t } from "i18next";

const fetchOrderItems = async (accessToken) => {
  const response = await axios.get(
    `${API_BASE_URL}${API_ENDPOINTS.ORDERITEMS}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

const FilterOrders = () => {
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [receiptFilter, setReceiptFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const accessToken = localStorage.getItem("token");

  const {
    data: orderItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orderItems"],
    queryFn: () => fetchOrderItems(accessToken),
  });

  useEffect(() => {
    if (orderItems.length > 0) {
      setFilteredOrderItems(orderItems);
      const uniqueProducts = [
        ...new Set(orderItems.map((item) => item.product)),
      ];
      setProducts(uniqueProducts);
    }
  }, [orderItems]);

  useEffect(() => {
    let filteredItems = orderItems;

    if (receiptFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) =>
          item.item_receipt ===
          (receiptFilter === "receipt" ? "Receipt" : "No Receipt")
      );
    }

    if (productFilter !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.product === productFilter
      );
    }

    setFilteredOrderItems(filteredItems);
    setCurrentPage(1);
  }, [receiptFilter, productFilter, orderItems]);

  const handleReceiptFilterChange = (event) => {
    setReceiptFilter(event.target.value);
  };

  const handleProductFilterChange = (event) => {
    setProductFilter(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const countWithReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "Receipt"
  ).length;
  const countWithoutReceipt = filteredOrderItems.filter(
    (item) => item.item_receipt === "No Receipt"
  ).length;

  const totalAmountSold = filteredOrderItems.reduce((total, item) => {
    return total + (parseFloat(item.price) || 0);
  }, 0);

  const columns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "product", headerName: t("products"), width: 150 },
    { field: "receipt", headerName: t("receipt"), width: 150 },
    { field: "package", headerName: t("package"), width: 150 },
    { field: "quantity", headerName: t("quantity"), width: 150 },
    { field: "price", headerName: t("price"), width: 150 },
    { field: "status", headerName: t("status"), width: 150 },
  ];

  const pageCount = Math.ceil(filteredOrderItems.length / itemsPerPage);
  const displayOrderItems = filteredOrderItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const rows = displayOrderItems.map((item, index) => ({
    id: (currentPage - 1) * itemsPerPage + index + 1,
    product: item.product_name,
    receipt: item.item_receipt,
    package: item.package,
    quantity: item.quantity,
    price: formatCurrency(item.price),
    status: item.status,
  }));

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="container p-5">
      <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
        {t("filter_order")}
      </h3>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 max-w-2xl">
        <div className="bg-white rounded-lg border hover:shadow-md shadow-sm transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("with_receipt")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {countWithReceipt}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("without_receipt")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {countWithoutReceipt}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200">
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-2">
              <p className="text-xs font-bold">{t("total_amount_sold")}</p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {formatCurrency(totalAmountSold)}
            </h3>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-4 mt-4">
        <FormControl fullWidth margin="normal">
          <InputLabel id="receipt-filter-label">
            {t("filter_by_receipt")}
          </InputLabel>
          <Select
            labelId="receipt-filter-label"
            id="receipt-filter"
            value={receiptFilter}
            label="Filter by Receipt"
            onChange={handleReceiptFilterChange}
          >
            <MenuItem value="all">{t("all")}</MenuItem>
            <MenuItem value="receipt">{t("with_receipt")}</MenuItem>
            <MenuItem value="no-receipt">{t("without_receipt")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="product-filter-label">
            {t("filter_by_product")}
          </InputLabel>
          <Select
            labelId="product-filter-label"
            id="product-filter"
            value={productFilter}
            label="Filter by Product"
            onChange={handleProductFilterChange}
          >
            <MenuItem value="all">{t("all")}</MenuItem>
            {products.map((product, index) => (
              <MenuItem key={index} value={product}>
                {product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div
        style={{ height: "auto", width: "100%", marginTop: "1rem" }}
        className="mb-14"
      >
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: -1,
            },
          }}
          rows={rows}
          columns={columns}
          loading={isLoading}
        />
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          className="mt-4 flex justify-center"
        />
      </div>
    </div>
  );
};

export default FilterOrders;

import React, { useState } from "react";
import { Modal, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceOld from "@/api/axiosOld.tsx";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { formatDateTypeStamp } from "/src/utils/formatDateTypeStamp.js";
import Pagination from "@mui/material/Pagination";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 3,
};

const fetchLogs = async (rowId) => {
    const response = await axiosInstanceOld.get(
        `${API_ENDPOINTS.EXPENSE_LOGS}${rowId}/logs`
    );
    return response.data;
};

const CustomerExpenseLogModal = ({ isOpen, onClose, selectedRow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { data, error, isLoading } = useQuery({
        queryKey: ["customerExpenseLogs", selectedRow?.id],
        queryFn: () => fetchLogs(selectedRow.id),
        enabled: !!selectedRow?.id, // Only fetch if selectedRow.id is available
    });

    if (isLoading) return <Typography>Loading...</Typography>;
    if (error)
        return <Typography>Error fetching logs: {error.message}</Typography>;

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const pageCount = Math.ceil(data?.length / itemsPerPage);
    const displayData = data?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">
                    Logs for Customer Expense ID: {selectedRow?.id}
                </Typography>
                <DataGrid
                    sx={{
                        "& .MuiDataGrid-footerContainer": { display: "none" },
                        "& .MuiDataGrid-scrollbar--horizontal": {
                            display: "scroll",
                            zIndex: 0,
                        },
                    }}
                    rows={displayData || []}
                    columns={[
                        { field: "id", headerName: "ID", width: 70 },
                        { field: "customer", headerName: "Customer", width: 150 },
                        { field: "change_type", headerName: "Change Type", width: 150 },
                        { field: "field_name", headerName: "Field Name", width: 150 },
                        { field: "old_value", headerName: "Old Value", width: 150 },
                        { field: "new_value", headerName: "New Value", width: 150 },
                        {
                            field: "timestamp",
                            headerName: "Timestamp",
                            width: 200,
                            valueFormatter: (params) => formatDateTypeStamp(params),
                        },
                        { field: "user", headerName: "User", width: 150 },
                    ]}
                    pageSize={itemsPerPage}
                    rowsPerPageOptions={[itemsPerPage]}
                />
                <Pagination
                    count={pageCount}
                    variant="outlined"
                    page={currentPage}
                    onChange={handlePageChange}
                    className="mt-4 flex justify-center"
                />
            </Box>
        </Modal>
    );
};

export default CustomerExpenseLogModal;

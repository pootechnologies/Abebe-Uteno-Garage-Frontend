import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstanceOld from "@/api/axiosOld";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import toast from "react-hot-toast";

const UpdateShanciTargaModal = ({ isOpen, onClose, selectedRow }) => {
    const [shanciKutir, setShanciKutir] = useState("");
    const [targaKutir, setTargaKutir] = useState("");
    const [servicePrice, setServicePrice] = useState("");

    const queryClient = useQueryClient();

    // Fetch data
    const { data, isLoading } = useQuery({
        queryKey: ["shancitarga", selectedRow],
        queryFn: async () => {
            const res = await axiosInstanceOld.get(
                `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedRow}`
            );
            return res?.data?.data;
        },
        enabled: !!selectedRow,
    });

    // Set values after fetch
    useEffect(() => {
        if (data) {
            setShanciKutir(data.shanci_kutir || "");
            setTargaKutir(data.targa_kutir || "");
            setServicePrice(data.service_charge || "");
        }
    }, [data]);

    // Mutation for UPDATE
    const updateMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axiosInstanceOld.patch(
                `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedRow}`,
                payload
            );
            return res.data;
        },

        onSuccess: () => {
            toast.success("Successfully updated!");

            // Refresh the query
            queryClient.invalidateQueries(["shancitarga", selectedRow]);

            onClose();
        },

        onError: () => {
            toast.error("Failed to update. Try again.");
        },
    });

    const handleUpdate = () => {
        updateMutation.mutate({
            shanci_kutir: shanciKutir,
            targa_kutir: targaKutir,
            service_charge: servicePrice,
        });
    };

    return (
        <div>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800/70 bg-opacity-50">
                    <div className="relative p-4 bg-white rounded-md shadow dark:bg-gray-800 sm:p-5 w-3/4 lg:w-1/2">
                        <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t("update_shanci_targa")}
                            </h3>
                        </div>

                        {isLoading ? (
                            <p className="text-center text-gray-600">{t("loading")}...</p>
                        ) : (
                            <form>
                                <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium">
                                            {t("shanci_kutir")}
                                        </label>
                                        <input
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-4"
                                            value={shanciKutir}
                                            onChange={(e) => setShanciKutir(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium">
                                            {t("targa_kutir")}
                                        </label>
                                        <input
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-4"
                                            value={targaKutir}
                                            onChange={(e) => setTargaKutir(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium">
                                            {t("service_charge")}
                                        </label>
                                        <input
                                            type="number" onWheel={(event) => event.currentTarget.blur()}
                                            step="0.01"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-4"
                                            value={servicePrice}
                                            onChange={(e) => setServicePrice(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        disabled={updateMutation.isPending}
                                        className={`text-white px-4 py-2 rounded-md ${updateMutation.isPending
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-[#55B990] hover:bg-[#54ce9b]"
                                            }`}
                                        onClick={handleUpdate}
                                    >
                                        {updateMutation.isPending
                                            ? t("updating...")
                                            : t("update")}
                                    </Button>

                                    <Button
                                        type="button"
                                        className="bg-[#FF5555] hover:bg-[#f37979] text-white"
                                        onClick={onClose}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateShanciTargaModal;

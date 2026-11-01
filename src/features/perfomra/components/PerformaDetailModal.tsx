import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/apiConfig.ts";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreVertical, Edit, Trash2, Hash, Tag, Box, Scale, Layers, DollarSign, Activity, Calculator, Pencil, AlertTriangle, Plus, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstanceOld from "@/api/axiosOld";

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "44px",
    paddingLeft: "2rem",
    borderRadius: "0.75rem",
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "rgba(5, 150, 105, 0.5)" : "rgba(100, 116, 139, 0.2)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(5, 150, 105, 0.1)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    "&:hover": {
      borderColor: state.isFocused ? "rgba(5, 150, 105, 0.5)" : "rgba(100, 116, 139, 0.35)",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#059669" : state.isFocused ? "rgba(16, 185, 129, 0.1)" : "transparent",
    color: state.isSelected ? "white" : "inherit",
    "&:active": { backgroundColor: "#059669" },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "inherit",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "rgba(100, 116, 139, 0.65)",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "inherit",
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

const unitOptions = [
  { value: "PCS", label: "PCS" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Liter", label: "Liter" },
];

// Get product options from fetched products
const getProductOptions = (products: any[]) => {
  return products.map((product) => ({
    value: product.id,
    label: product.part_number ? `${product.name} - ${product.part_number}` : product.name,
    name: product.name,
    part_number: product.part_number,
    unit: product.unit,
    selling_price: product.selling_price,
    stock: product.stock,
    id: product.id,
  }));
};

// Get part numbers for a selected product from fetched products
const getPartNumbersForProduct = (productName: string, products: any[]) => {
  return products
    .filter((product) => product.name === productName)
    .map((product) => ({
      value: product.part_number,
      label: product.part_number,
    }));
};

const PerformaDetailModal = ({
  showPerformaDetailsModal,
  closeModal,
  selectedPerformaDetailId,
}) => {
  const { t } = useTranslation();
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editPerformaItem, setEditPerformaItem] = useState(null);
  const [originalPerformaItem, setOriginalPerformaItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddPerformaModal, setShowAddPerformaModal] = useState(false);
  const [isAddingPerforma, setIsAddingPerforma] = useState(false);
  const itemRefs = useRef([]);
  const [items, setItems] = useState([
    { product_id: "", product_name: "", part_number: "", unit: "", quantity: 1, unitPrice: "", product_service_charge: "", stock: 0 },
  ]);
  const [errors, setErrors] = useState({ product_name: {}, unitPrice: {} });
  const [products, setProducts] = useState([]);
  const modalItemsPerPage = 5;

  const productOptions = getProductOptions(products);

  const fetchPerformaDetails = async (selectedPerformaDetailId) => {
    const { data } = await axiosInstanceOld.get(
      `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedPerformaDetailId}`
    );
    return data;
  };

  const { data: performaDetailItems, isLoading } = useQuery({
    queryKey: ["performaDetailItems", selectedPerformaDetailId],
    queryFn: () => fetchPerformaDetails(selectedPerformaDetailId),
    enabled: !!selectedPerformaDetailId,
  });

  const selectedPerforma = performaDetailItems?.data?.products;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_ENDPOINTS.PRODUCTS}?include_all=True`
        );
        setProducts(
          response?.data?.all_results?.map((product) => ({
            id: product.id,
            name: product.name,
            part_number: product.part_number,
            unit: product.unit,
            selling_price: product.selling_price,
            buying_price: product.buying_price,
            stock: product.stock,
          })) || []
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);
  const queryClient = useQueryClient();

  const handleQuantityChange = (index, e) => {
    const newItems = [...items];
    newItems[index].quantity = e.target.value;
    setItems(newItems);
  };

  const handleProductNameChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].product_name = selectedOption?.name || "";
    newItems[index].product_id = selectedOption?.value || "";
    newItems[index].stock = selectedOption?.stock || 0;

    // Use the data from the selected option which includes all product fields
    if (selectedOption) {
      newItems[index].part_number = selectedOption.part_number || "";
      newItems[index].unitPrice = selectedOption.selling_price || "";

      // Try to find matching unit from unitOptions, or use product unit as-is
      const productUnit = selectedOption.unit || "";
      const matchingUnitOption = unitOptions.find(option =>
        option.value.toLowerCase() === productUnit.toLowerCase()
      );
      newItems[index].unit = matchingUnitOption?.value || productUnit;
    }

    setItems(newItems);
    const newErrors = { ...errors };
    if (!selectedOption?.value) {
      newErrors.product_name[index] = t("product_name_required");
    } else {
      delete newErrors.product_name[index];
    }
    setErrors(newErrors);
  };

  const handlePartNumberChange = (index, selectedOption) => {
    const newItems = [...items];
    newItems[index].part_number = selectedOption?.value || "";
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        product_name: "",
        part_number: "",
        unit: "",
        quantity: 1,
        unitPrice: "",
        product_service_charge: "",
        stock: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    const newErrors = { ...errors };
    delete newErrors.product_name[index];
    delete newErrors.unitPrice[index];
    setErrors(newErrors);
  };

  const handleAddPerforma = async (event) => {
    event.preventDefault();
    if (isAddingPerforma) return;

    let hasError = false;
    const newErrors = { product_name: {}, unitPrice: {} };
    items.forEach((item, index) => {
      if (item.product_name === "") {
        newErrors.product_name[index] = t("product_name_required");
        hasError = true;
      }
      if (!item.product_id) {
        newErrors.product_name[index] = t("product_required");
        hasError = true;
      }
      if (item.unitPrice === "" || item.unitPrice === undefined) {
        newErrors.unitPrice[index] = t("unit_price_required");
        hasError = true;
      }
    });
    setErrors(newErrors);
    if (hasError) return;

    setIsAddingPerforma(true);

    const newPerformaItems = items.map((item) => ({
      product: item.product_id,
      part_number: item.part_number,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      product_service_charge: item.product_service_charge || "0.00",
      // service_price: item.product_service_charge || "0.00",
    }));

    // Convert existing items to use product IDs if they use product names
    const normalizedExistingItems = selectedPerforma?.map(existingItem => {
      // If product is a string (name), find the corresponding ID
      if (typeof existingItem.product === 'string') {
        const matchingProduct = products.find(p => p.name === existingItem.product);
        return {
          ...existingItem,
          product: matchingProduct?.id || existingItem.product,
        };
      }
      return existingItem;
    }) || [];

    const updatedPerforma = {
      ...selectedPerforma,
      products: [...normalizedExistingItems, ...newPerformaItems],
    };
    try {
      const response = await axiosInstanceOld.patch(
        `${API_ENDPOINTS.PERFORMA_PERFORMAS}${selectedPerformaDetailId}`,
        updatedPerforma
      );
      if (response.status === 200) {
        toast.success("Performa items added successfully!");
        queryClient.invalidateQueries([
          "performaDetailItems",
          selectedPerformaDetailId,
        ]);
        setShowAddPerformaModal(false);
        setItems([
          {
            product_id: "",
            product_name: "",
            part_number: "",
            unit: "",
            quantity: 1,
            unitPrice: "",
            product_service_charge: "",
            stock: 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating performa items:", error);
      toast.error("Failed to update performa items.");
    } finally {
      setIsAddingPerforma(false);
    }
  };

  const updatePerformaItemMutation = useMutation({
    mutationFn: (updatedData) => {
      const { id, ...delta } = updatedData;
      return axiosInstanceOld.patch(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${id}`,
        delta
      );
    },
    onSuccess: () => {
      toast.success("Performa item updated successfully!");
      queryClient.invalidateQueries([
        "performaDetailItems",
        selectedPerformaDetailId,
      ]);
      setEditPerformaItem(null);
      setShowUpdateModal(false);
    },
    onError: () => {
      toast.error("Failed to update performa item!");
    },
  });

  const deletePerformaItemMutation = useMutation({
    mutationFn: (performaItemId) =>
      axiosInstanceOld.delete(
        `${API_ENDPOINTS.PERFORMA_PRODUCTS}${performaItemId}`
      ),
    onSuccess: (data, variables) => {
      toast.success("Performa item deleted successfully!");
      queryClient.invalidateQueries([
        "performaDetailItems",
        selectedPerformaDetailId,
      ]);
    },
    onError: () => {
      toast.error("Failed to delete performa item!");
    },
  });

  useEffect(() => {
    if (itemRefs.current.length > 0) {
      const lastItemRef = itemRefs.current[itemRefs.current.length - 1];
      if (lastItemRef) {
        lastItemRef.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [items]);

  useEffect(() => {
    setModalCurrentPage(1);
  }, [selectedPerformaDetailId, showPerformaDetailsModal]);

  const {
    register,
    handleSubmit: handleUpdateSubmit,
    setValue,
    formState: { errors: updateErrors },
  } = useForm();

  useEffect(() => {
    if (editPerformaItem) {
      setValue("product", editPerformaItem.product);
      setValue("product_name", editPerformaItem.product_name);
      setValue("unit", editPerformaItem.unit);
      setValue("quantity", editPerformaItem.quantity);
      setValue("unit_price", editPerformaItem.unit_price);
      setValue("product_service_charge", editPerformaItem.product_service_charge || 0);
    }
  }, [editPerformaItem, setValue]);

  const handleEditClick = (item) => {
    setEditPerformaItem(item);
    setOriginalPerformaItem({ ...item });
    setShowUpdateModal(true);
  };

  const onUpdateSubmit = (data) => {
    const updatedPerformaItem = {
      ...editPerformaItem,
      product: data.product,
      product_name: data.product_name,
      part_number: data.part_number,
      unit: data.unit,
      quantity: data.quantity,
      unit_price: data.unit_price,
      product_service_charge: data.product_service_charge,
    };
    const delta = {};
    if (updatedPerformaItem.product !== originalPerformaItem.product) {
      delta.product = updatedPerformaItem.product;
    }
    if (updatedPerformaItem.unit !== originalPerformaItem.unit) {
      delta.unit = updatedPerformaItem.unit;
    }
    if (updatedPerformaItem.quantity !== originalPerformaItem.quantity) {
      delta.quantity = updatedPerformaItem.quantity;
    }
    if (updatedPerformaItem.unit_price !== originalPerformaItem.unit_price) {
      delta.unit_price = updatedPerformaItem.unit_price;
    }
    if (updatedPerformaItem.product_service_charge !== originalPerformaItem.product_service_charge) {
      delta.product_service_charge = updatedPerformaItem.product_service_charge;
    }
    if (Object.keys(delta).length > 0) {
      updatePerformaItemMutation.mutate({ id: editPerformaItem.id, ...delta });
    }
  };

  const handleDeleteClick = (performaItemId) => {
    setProductToDelete(performaItemId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deletePerformaItemMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  if (!showPerformaDetailsModal) {
    return null;
  }

  const sortedItems = [...(selectedPerforma || [])].sort((a, b) => b.id - a.id);
  const modalPageCount = Math.max(
    Math.ceil(sortedItems.length / modalItemsPerPage),
    1
  );
  const displayModalItems = sortedItems.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center overflow-auto z-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-5xl">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
          {t("performa_details")}
        </h2>
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddPerformaModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 mb-1 text-white rounded-lg px-4 py-2 font-medium transition-colors"
          >
            {t("add_products")}
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center py-10">{t("loading")}...</div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40">
                    <TableHead className="w-[100px] font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                        {t("id")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {t("product_name")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Box className="h-3.5 w-3.5 text-primary" />
                        {t("part_number")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        {t("unit")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        {t("quantity")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("unit_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        {t("service_cost")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-3.5 w-3.5 text-primary" />
                        {t("total_price")}
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-foreground text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayModalItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground font-medium">
                        {t("no_data_found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayModalItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground font-medium">#{item.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{item.product_name || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{item.part_number || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{item.quantity}</TableCell>
                        <TableCell className="text-muted-foreground font-medium">{item.unit_price}</TableCell>
                        <TableCell className="text-muted-foreground">{item.product_service_charge || 0}</TableCell>
                        <TableCell className="font-semibold">{item.total_price}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-xl border-muted">
                              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleEditClick(item)}
                                className="gap-3 rounded-lg px-2 py-2.5"
                              >
                                <Pencil className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-sm">{t("update")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(item.id)}
                                className="gap-3 rounded-lg px-2 py-2.5 focus:bg-destructive/10 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="font-bold text-sm">{t("delete")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-muted mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalCurrentPage(modalCurrentPage - 1)}
                  disabled={modalCurrentPage === 1}
                  className="gap-2 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex items-center gap-1 mx-2 text-sm font-medium">
                  {modalCurrentPage} / {modalPageCount}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalCurrentPage(modalCurrentPage + 1)}
                  disabled={modalCurrentPage === modalPageCount}
                  className="gap-2 rounded-lg"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            onClick={closeModal}
          >
            {t("close")}
          </Button>
        </div>
      </div>
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-[1001]">
          <div className="bg-destructive/5 px-6 py-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-destructive/10 text-destructive rounded-full shadow-inner animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-destructive">
                {t("are_you_sure")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground font-medium px-4 leading-relaxed">
              {t("sure_discription_performa")}
            </p>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
              disabled={deletePerformaItemMutation?.isPending || deletePerformaItemMutation?.isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletePerformaItemMutation?.isPending || deletePerformaItemMutation?.isLoading}
              className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-destructive/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50"
            >
              {(deletePerformaItemMutation?.isPending || deletePerformaItemMutation?.isLoading) ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-20">
          <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3 mb-4">
              {t("update_performa")}
            </h2>
            <form onSubmit={handleUpdateSubmit(onUpdateSubmit)}>
              <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 shadow-sm">
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    {...register("product_name")}
                    defaultValue={editPerformaItem?.product_name || ""}
                    readOnly
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-gray-100 dark:bg-gray-800 cursor-not-allowed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <input
                    type="hidden"
                    {...register("product", {
                      required: t("product_required"),
                    })}
                    defaultValue={editPerformaItem?.product || ""}
                  />
                  {updateErrors.product && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">
                      {updateErrors.product.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    {t("part_number")}
                  </label>
                  <input
                    type="text"
                    {...register("part_number")}
                    defaultValue={editPerformaItem?.part_number || ""}
                    readOnly
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-gray-100 dark:bg-gray-800 cursor-not-allowed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {updateErrors.part_number && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">
                      {updateErrors.part_number.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">{t("unit")}</label>
                  <input
                    type="text"
                    {...register("unit")}
                    className={`w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${updateErrors.unit ? "border-red-500 dark:border-red-500" : ""
                      }`}
                  />
                  {updateErrors.unit && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">
                      {updateErrors.unit.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">{t("quantity")}</label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    {...register("quantity", {
                      required: t("quantity_required"),
                      min: {
                        value: 1,
                        message: t("quantity_must_greater_zero"),
                      },
                    })}
                    className={`w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${updateErrors.quantity ? "border-red-500 dark:border-red-500" : ""
                      }`}
                  />
                  {updateErrors.quantity && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">
                      {updateErrors.quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    {t("unit_price")}
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    {...register("unit_price", {
                      required: t("unit_price_required"),
                      min: {
                        value: 0.01,
                        message: t("unit_price_must_greater_zero"),
                      },
                    })}
                    step="0.01"
                    className={`w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${updateErrors.unit_price ? "border-red-500 dark:border-red-500" : ""
                      }`}
                  />
                  {updateErrors.unit_price && (
                    <p className="text-red-500 text-sm mt-1.5 font-medium">
                      {updateErrors.unit_price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    Product Service Cost
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    {...register("product_service_charge")}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg font-medium transition-colors"
                  onClick={() => setShowUpdateModal(false)}
                >
                  {t("cancel")}
                </Button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t("update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddPerformaModal && (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-[60]">
          <div className="bg-white dark:bg-gray-900 border border-muted p-6 md:p-8 rounded-2xl shadow-xl w-[90%] lg:max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-emerald-500/10 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  {t("add_products")}
                </h2>
                <p className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {items.length} {t("product")}
                </p>
              </div>
              <div className="h-[60vh] overflow-auto pr-2 space-y-6">
                {items.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl space-y-5 relative shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`product_name-${index}`}
                        className="block text-sm font-semibold text-muted-foreground"
                      >
                        {t("product_name")}
                      </label>
                      <div className="relative group mt-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                        <CreatableSelect
                          options={productOptions}
                          value={
                            item.product_id
                              ? productOptions.find((p) => p.value == item.product_id)
                              : null
                          }
                          onChange={(selectedOption) => handleProductNameChange(index, selectedOption)}
                          placeholder={t("select_product")}
                          isClearable
                          styles={{
                            ...customSelectStyles,
                            control: (provided: any, state: any) => ({
                              ...customSelectStyles.control(provided, state),
                              borderColor: errors.product_name[index] ? "red" : provided.borderColor,
                              paddingLeft: "2.5rem",
                              boxShadow: errors.product_name[index] ? "0 0 0 3px rgba(255, 0, 0, 0.1)" : provided.boxShadow,
                            }),
                          }}
                          classNamePrefix="react-select"
                        />
                      </div>
                      {errors.product_name[index] && (
                        <p className="mt-1 text-sm text-red-600 font-medium">
                          {errors.product_name[index]}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`unit-price-${index}`}
                          className="block text-sm font-semibold text-muted-foreground"
                        >
                          {t("unit_price")}
                        </label>
                        <input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          id={`unit-price-${index}`}
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].unitPrice = e.target.value;
                            setItems(newItems);
                          }}
                          className={`w-full border-2 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.unitPrice[index] ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                            }`}
                        />
                        {errors.unitPrice[index] && (
                          <p className="mt-1 text-sm text-red-600 font-medium">
                            {errors.unitPrice[index]}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-row justify-between">
                          <label
                            htmlFor={`quantity-${index}`}
                            className="block text-sm font-semibold text-muted-foreground"
                          >
                            {t("quantity")}
                          </label>
                          {item.product_id && (
                            <span
                              className={`text-xs font-bold ${item.stock > 0 ? "text-emerald-600" : "text-red-500"
                                }`}
                            >
                              Stock available: {item.stock}
                            </span>
                          )}
                        </div>
                        <input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          id={`quantity-${index}`}
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e)}
                          className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`product_service_charge-${index}`}
                          className="block text-sm font-semibold text-muted-foreground"
                        >
                          Product Service Charge
                        </label>
                        <input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          id={`product_service_charge-${index}`}
                          step="0.01"
                          placeholder="0.00"
                          value={item.product_service_charge}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].product_service_charge = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      {/* Total Price Field */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`total-price-${index}`}
                          className="block text-sm font-semibold text-muted-foreground"
                        >
                          {t("total_price")}
                        </label>
                        <input
                          type="number" onWheel={(event) => event.currentTarget.blur()}
                          id={`total-price-${index}`}
                          value={(item.quantity * item.unitPrice).toFixed(2)}
                          readOnly
                          disabled
                          className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      {items.length > 1 && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-colors h-9 px-3"
                          type="button"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 pt-4 border-t border-muted">
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  className="w-full sm:w-auto border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium transition-colors gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t("add_more")}
                </Button>
                <div className="flex flex-row space-x-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => setShowAddPerformaModal(false)}
                    variant="outline"
                    className="flex-1 sm:flex-none rounded-lg font-medium transition-colors border-muted hover:bg-muted/50"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddPerforma}
                    disabled={isAddingPerforma}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {isAddingPerforma ? (
                      <>
                        <Spinner className="mr-2 size-4" />
                        Submitting...
                      </>
                    ) : (
                      t("submit")
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformaDetailModal;

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  IMAGE_BASE_URL,
} from "@/utils/apiConfig.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { formatTimestamp } from "@/utils/timeFormater";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { t } from "i18next";
import AddOrderModal from "./AddOrderModal";
import OrderLogsModal from "./OrderLogsModal";
import OrderPaymentStatusModal from "./OrderPaymentStatusModal";
import OrderDetailModal from "./OrderDetailModal";
import DownloadConfirmationModal from "./DownloadConfirmationModal";
import Select from "react-select";
import {
  MoreVertical,
  FileText,
  ReceiptText,
  Eye,
  ActivitySquare,
  BadgeCheck,
  DollarSign,
  Search,
  Hash,
  UserCircle,
  Calendar,
  Layers,
  Percent,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MyDoc,
  ReceiptPosPDF,
  PDFModal,
  ReceiptPos,
} from "../components/ManageCreditPdf .tsx";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import axiosInstanceOld from "@/api/axiosOld";

const PAGE_SIZE = 10; // Match your backend page size

function ManageCredit() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const modalItemsPerPage = 5;
  const [isVisible, setIsVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [filters, setFilters] = useState({
    customerName: "",
    orderDate: "",
    totalAmount: "",
    receipt: "",
  });
  const [showPDF, setShowPDF] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [receiptPosData, setReceiptPosData] = useState(null);
  const [showReceiptPosModal, setShowReceiptPosModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showOrderLogModal, setShowOrderLogModal] = useState(false);
  const [selectedRowOrder, setSelectedRowOrder] = useState();
  const [selectedOrderId, setSelectedOrderId] = useState();
  const [
    showSelectedOrderPaymentStatusModal,
    setShowSelectedOrderPaymentStatusModal,
  ] = useState(false);
  const [selectedRowPayment, setSelectedRowPayment] = useState();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSimplifiedView, setIsSimplifiedView] = useState(true);
  const [orderFourDegit, setOrderFourDegit] = useState();
  const [showDownloadConfirmation, setShowDownloadConfirmation] =
    useState(false);
  const [orderToDownload, setOrderToDownload] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      axiosInstanceOld
        .get(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`)
        .then((res) => res?.data?.results || []),
    staleTime: 0,
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", currentPage, searchTerm, filters],
    queryFn: async () => {
      let url = `${API_BASE_URL}${API_ENDPOINTS.CREDIT}?page=${currentPage}&page_size=${PAGE_SIZE}`;
      if (searchTerm) url += `&search="${searchTerm}"`; // Wrap searchTerm in quotes
      if (filters.customerName)
        url += `&customer_name="${filters.customerName}"`; // Wrap customerName in quotes
      if (filters.orderDate) url += `&order_date="${filters.orderDate}"`; // Wrap orderDate in quotes
      if (filters.totalAmount) url += `&total_amount="${filters.totalAmount}"`; // Wrap totalAmount in quotes
      if (filters.receipt) url += `&receipt="${filters.receipt}"`; // Wrap receipt in quotes
      const response = await axiosInstanceOld.get(url);
      return response?.data;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 1000,
  });

  const { data: orderFourDegitFetch } = useQuery({
    queryKey: ["orderFourDegitFetch", selectedOrderId],
    queryFn: () =>
      axiosInstanceOld
        .get(`${API_BASE_URL}${API_ENDPOINTS.ORDERS}${selectedOrderId}`)
        .then((res) => {
          setOrderFourDegit(res?.data.id);
          return res?.data.id;
        }),
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
    staleTime: 0,
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`,
        );
        setCompanyData(response.data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstanceOld.get(
          `${API_BASE_URL}${API_ENDPOINTS.CUSTOMERS}`,
        );
        setCustomers(response?.data?.results);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      axiosInstanceOld.patch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERITEMS}/${updatedProduct.id}`,
        updatedProduct,
      ),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setEditProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (updatedOrder) =>
      axiosInstanceOld.patch(
        `${API_BASE_URL}${API_ENDPOINTS.ORDERS}${updatedOrder.orderId}`,
        updatedOrder,
      ),
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setSelectedOrderForStatus(null);
      setSelectedStatus("");
    },
    onError: () => {
      toast.error("Failed to update order status!");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstanceOld.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: (data, variables) => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["orders"]);
      // Check if the response contains number_of_items and it's <= 0
      if (data?.data?.number_of_items <= 0) {
        setShowOrderModal(false); // Close the modal
        setSelectedOrder(null);
      }
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderItems(order.items);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setEditProduct(null);
    setSelectedItem(null);
    setShowOrderModal(false);
    setShowPDF(false);
    setShowConfirmationModal(false);
    setShowStatusModal(false);
    setShowReceiptPosModal(false);
    setShowDeleteModal(false);
  };

  const closeModalAdd = () => {
    setShowAddOrderModal(false);
  };

  const closeModalOrderLog = () => {
    setShowOrderLogModal(false);
  };

  const closeOrderPaymentStatus = () => {
    setShowSelectedOrderPaymentStatusModal(false);
  };

  const handleProductUpdate = () => {
    const updatedProducts = orderItems.map((item) => {
      if (item.id === editProduct.id) {
        return {
          quantity: editProduct.quantity,
          unit_price: editProduct.unit_price,
          status: editProduct.status,
        };
      }
      return item;
    });
    setOrderItems(updatedProducts);
    setEditProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    const filteredProducts = orderItems.filter((item) => item.id !== productId);
    setOrderItems(filteredProducts);
  };

  const handleUpdateSubmit = (data) => {
    const updatedProduct = {
      id: editProduct.id,
      unit_price: data.unit_price,
      quantity: data.quantity,
      status: data.status,
    };
    setEditProduct(updatedProduct);
    setShowConfirmationModal(true);
  };

  const handleConfirmUpdate = () => {
    if (editProduct) {
      updateProductMutation.mutate(editProduct);
      setShowConfirmationModal(false);
      setEditProduct(null);
    }
  };

  const handleDeleteSubmit = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const sortedOrders = ordersData?.results?.sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date),
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const modalPageCount = Math.ceil(orderItems?.length / modalItemsPerPage);
  const displayModalItems = orderItems?.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage,
  );

  const handleModalPageChange = (event, value) => {
    setModalCurrentPage(value);
  };

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (editProduct) {
      setValue("quantity", editProduct.quantity);
      setValue("unit_price", editProduct.unit_price);
      setValue("status", editProduct.status);
    }
  }, [editProduct, setValue]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = isLoadingOrders || isLoadingProducts;

  const handleGeneratePDF = async (order) => {
    try {
      const response = await axiosInstanceOld.get(
        `${API_BASE_URL}${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`,
      );
      const receipt = response.data;
      setReceiptData(receipt);
      const updatedOrder = {
        ...order,
        customer: receipt?.customer?.name,
        items: receipt.items.map((item) => ({
          ...item,
          product: item.product_name,
        })),
        total_amount: receipt.order_details.total_amount,
        order_date: receipt.order_details.date,
        status: receipt.order_details.status,
      };
      setSelectedOrder(updatedOrder);

      // Generate PDF blob
      const blob = await pdf(
        <MyDoc
          orderFourDegit={orderFourDegit}
          order={updatedOrder}
          products={products}
          companyData={companyData}
          receiptData={receipt}
        />,
      ).toBlob();

      // Create blob URL and open in new tab
      const blobUrl = URL.createObjectURL(blob);
      if (isMobile) {
        // Mobile: show download confirmation
        setOrderToDownload(updatedOrder);
        setShowDownloadConfirmation(true);
      } else {
        // Desktop: open in new tab
        window.open(blobUrl, "_blank");
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    }
  };

  const handleConfirmDownload = async () => {
    if (orderToDownload) {
      const blob = await pdf(
        <MyDoc
          orderFourDegit={orderFourDegit}
          order={orderToDownload}
          products={products}
          companyData={companyData}
          receiptData={receiptData}
        />,
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const customerName = orderToDownload?.customer || "customer";
      const orderDate = formatTimestamp(orderToDownload?.order_date);
      link.download = `Receipt_${customerName}_${orderDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadConfirmation(false);
      setOrderToDownload(null);
    }
  };

  const handleShowReceiptPos = async (order) => {
    try {
      const response = await axiosInstanceOld.get(
        `${API_BASE_URL}${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`,
      );
      const receiptData = response.data;
      if (isMobile) {
        const blob = await pdf(
          <ReceiptPosPDF receiptData={receiptData} />,
        ).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `receipt_pos_${order.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setReceiptPosData(receiptData);
        setShowReceiptPosModal(true);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    }
  };

  const handleStatusUpdate = () => {
    if (selectedOrderForStatus) {
      const orderId = selectedOrderForStatus.id;
      const updatedOrder = {
        orderId: orderId,
        status: selectedStatus,
      };
      updateStatusMutation.mutate(updatedOrder);
      setShowStatusModal(false);
    }
  };

  const toggleView = () => {
    setIsSimplifiedView(!isSimplifiedView);
  };

  const handleAddOrderClick = () => {
    setShowAddOrderModal(true);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };

  const rows = ordersData?.results?.map((order, index) => ({
    id: order.id,
    customer: order.customer_name || "N/A",
    order_date: formatTimestamp(order.order_date),
    receipt: order.receipt,
    sub_total: formatCurrency(order.sub_total),
    vat: formatCurrency(order.vat),
    number_of_items: order.number_of_items,
    status: order.status,
    total_amount: formatCurrency(order.total_amount),
    payment_status: order.payment_status,
    paid_amount: formatCurrency(order.paid_amount),
    unpaid_amount: formatCurrency(order.unpaid_amount),
    user: order.user,
    performa: order.performa,
    actions: order,
  }));

  const totalPages = ordersData?.count
    ? Math.ceil(ordersData.count / PAGE_SIZE)
    : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            {t("manage_credit")}
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Toolbar / Search Section */}
          <div className="bg-card border rounded-xl p-4 shadow-sm backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-72 xl:w-80 group">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  id="customer-name"
                  options={[
                    { label: t("all_customers"), value: null },
                    ...customers.map((customer) => ({
                      label: customer.organization,
                      value: customer,
                    })),
                  ]}
                  placeholder={t("select_customer_name")}
                  onChange={(selectedOption) => {
                    setSelectedCustomer(selectedOption?.value || null);
                    handleSearch(
                      selectedOption?.value ? selectedOption.value.organization : null,
                    );
                  }}
                  value={
                    selectedCustomer
                      ? {
                          label: selectedCustomer.organization,
                          value: selectedCustomer,
                        }
                      : null
                  }
                  isClearable
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "1.75rem",
                      borderRadius: "0.75rem",
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      "&:hover": {
                        borderColor: "var(--primary)",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    })
                  }}
                />
              </div>

              <div className="relative w-full md:w-64 group">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                <Select
                  id="payment-status"
                  options={[
                    { label: t("paid"), value: "Paid" },
                    { label: t("pending"), value: "Pending" },
                    { label: t("unpaid"), value: "Unpaid" },
                  ]}
                  placeholder={t("select_payment_status")}
                  onChange={(selectedOption) => {
                    setSelectedStatus(selectedOption?.value || "");
                    handleSearch(selectedOption?.value || "");
                  }}
                  value={
                    selectedStatus
                      ? {
                          label: t(selectedStatus),
                          value: selectedStatus,
                        }
                      : null
                  }
                  isClearable
                  className="w-full react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "1.75rem",
                      borderRadius: "0.75rem",
                      borderColor: "var(--border)",
                      backgroundColor: "transparent",
                      "&:hover": {
                        borderColor: "var(--primary)",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                    })
                  }}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
                <Button
                  variant="outline"
                  onClick={toggleView}
                  className="rounded-lg h-10 px-4 text-sm font-medium border-muted hover:bg-muted/50"
                >
                  {isSimplifiedView ? t("detailed") : t("simplified")}
                </Button>
                
                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t("total_credits") || "Total Credits"}: <span className="font-semibold text-foreground">{ordersData?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-card border rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
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
                      <UserCircle className="h-3.5 w-3.5 text-primary" />
                      {t("customer_name")}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {t("order_date")}
                    </div>
                  </TableHead>
                  {!isSimplifiedView && (
                    <>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          {t("number_of_items")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          {t("receipt")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("sub_total")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Percent className="h-3.5 w-3.5 text-primary" />
                          {t("vat")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("total_amount")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("paid_amount")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          {t("unpaid_amount")}
                        </div>
                      </TableHead>
                    </>
                  )}
                  {isSimplifiedView && (
                    <>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          {t("receipt")}
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          {t("number_of_items")}
                        </div>
                      </TableHead>
                    </>
                  )}
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {t("payment_status")}
                    </div>
                  </TableHead>
                  {!isSimplifiedView && (
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                        {t("status")}
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      {t("performa")}
                    </div>
                  </TableHead>
                  {!isSimplifiedView && (
                    <TableHead className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5 text-primary" />
                        {t("created_by")}
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-foreground text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: isSimplifiedView ? 8 : 15 }).map((_, j) => (
                        <TableCell key={j} className="h-16">
                          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : rows?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSimplifiedView ? 8 : 15} className="h-32 text-center text-muted-foreground font-medium">
                      {t("no_record_found") || "No orders found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows?.map((row) => (
                    <TableRow key={row.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">#{row.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{row.customer}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{row.order_date}</TableCell>
                      {!isSimplifiedView && (
                        <>
                          <TableCell className="text-muted-foreground font-medium">{row.number_of_items}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">{row.receipt}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">{row.sub_total}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">{row.vat}</TableCell>
                          <TableCell className="font-semibold text-emerald-600">{row.total_amount}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">{row.paid_amount}</TableCell>
                          <TableCell className="font-medium text-red-600 dark:text-red-400">{row.unpaid_amount}</TableCell>
                        </>
                      )}
                      {isSimplifiedView && (
                        <>
                          <TableCell className="text-muted-foreground font-medium">{row.receipt}</TableCell>
                          <TableCell className="text-muted-foreground font-medium">{row.number_of_items}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.payment_status === "Paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : row.payment_status === "Pending"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {row.payment_status}
                        </span>
                      </TableCell>
                      {!isSimplifiedView && (
                        <>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                row.status === "Done"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : row.status === "Pending"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.performa
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {row.performa ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      {!isSimplifiedView && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                              {(row.user || "U").substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{row.user}</span>
                          </div>
                        </TableCell>
                      )}
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
                              onClick={() => {
                                setSelectedOrderForStatus(row.actions);
                                setSelectedStatus(row.actions.status);
                                setShowStatusModal(true);
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <BadgeCheck className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("status")}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setPaymentStatus(row.payment_status);
                                setPaidAmount(row.paid_amount);
                                setSelectedRowPayment(row.actions);
                                setShowSelectedOrderPaymentStatusModal(true);
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <DollarSign className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">{t("payment_status")}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setShowOrderLogModal(true);
                                setSelectedRowOrder(row.id);
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <ActivitySquare className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm">{t("logs")}</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrderId(row.actions.id);
                                showOrderDetails(row.actions);
                              }}
                              className="gap-3 rounded-lg px-2 py-2.5"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{t("view")}</span>
                            </DropdownMenuItem>
                            
                            {row.actions.status !== "Pending" &&
                              row.actions.status !== "Cancelled" && (
                                <>
                                  <DropdownMenuSeparator className="bg-muted" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrderId(row.actions.id);
                                      handleGeneratePDF(row.actions);
                                    }}
                                    className="gap-3 rounded-lg px-2 py-2.5"
                                  >
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                    <span className="font-medium text-sm">{t("receipt")}</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Cards */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                  </div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </div>
              ))
            ) : rows?.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <p className="font-medium text-muted-foreground">{t("no_orders_found") || "No orders found"}</p>
              </div>
            ) : (
              rows?.map((row) => (
                <div key={row.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-4 relative group hover:border-primary/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded leading-none">#{row.id}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                            row.payment_status === "Paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : row.payment_status === "Pending"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {row.payment_status}
                        </span>
                        {!isSimplifiedView && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                              row.status === "Pending"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : row.status === "Done"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {row.status}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("customer_name")}</span>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">{row.customer}</h3>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 shadow-xl border-muted/50">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1.5">{t("actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted/50" />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrderForStatus(row.actions);
                            setSelectedStatus(row.actions.status);
                            setShowStatusModal(true);
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-primary/10 transition-colors"
                        >
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md">
                            <BadgeCheck className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("status")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPaymentStatus(row.payment_status);
                            setPaidAmount(row.paid_amount);
                            setSelectedRowPayment(row.actions);
                            setShowSelectedOrderPaymentStatusModal(true);
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors"
                        >
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <DollarSign className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("payment_status")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setShowOrderLogModal(true);
                            setSelectedRowOrder(row.id);
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors"
                        >
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <ActivitySquare className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("logs")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrderId(row.actions.id);
                            showOrderDetails(row.actions);
                          }}
                          className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors"
                        >
                          <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                            <Eye className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{t("view")}</span>
                        </DropdownMenuItem>
                        {row.actions.status !== "Pending" &&
                          row.actions.status !== "Cancelled" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrderId(row.actions.id);
                                handleGeneratePDF(row.actions);
                              }}
                              className="gap-3 rounded-lg px-2 py-2 focus:bg-blue-500/10 transition-colors"
                            >
                              <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md">
                                <FileText className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium text-sm">{t("receipt")}</span>
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("order_date")}</span>
                      <span className="font-medium text-foreground">{row.order_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("number_of_items")}</span>
                      <span className="font-medium text-foreground">{row.number_of_items}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("receipt")}</span>
                      <span className="font-medium text-foreground">{row.receipt}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("performa")}</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.performa
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {row.performa ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("total_amount")}</span>
                      <span className="font-semibold text-emerald-600">{row.total_amount}</span>
                    </div>
                    
                    {!isSimplifiedView && (
                      <>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("sub_total")}</span>
                          <span className="font-medium text-foreground">{row.sub_total}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("vat")}</span>
                          <span className="font-medium text-foreground">{row.vat}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("paid_amount")}</span>
                          <span className="font-medium text-foreground">{row.paid_amount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">{t("unpaid_amount")}</span>
                          <span className="font-medium text-red-600 dark:text-red-400">{row.unpaid_amount}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {!isSimplifiedView && (
                    <div className="pt-2 border-t border-muted/50 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t("created_by")}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/20">
                            {(row.user || "U").substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-foreground truncate">{row.user}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination Section */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                  }
                  if (pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="gap-2 rounded-lg"
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderModal}
          onClose={closeModal}
          displayModalItems={displayModalItems}
          modalItemsPerPage={modalItemsPerPage}
          modalPageCount={modalPageCount}
          modalCurrentPage={modalCurrentPage}
          handleModalPageChange={handleModalPageChange}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleConfirmDelete={handleConfirmDelete}
          handleAddOrderClick={handleAddOrderClick}
          showItemDetails={showItemDetails}
          setEditProduct={setEditProduct}
          handleDeleteSubmit={handleDeleteSubmit}
          t={t}
          selectedOrderId={selectedOrderId}
        />
      )}
      {showDownloadConfirmation && (
        <DownloadConfirmationModal
          isOpen={showDownloadConfirmation}
          onClose={() => {
            setShowDownloadConfirmation(false);
            setOrderToDownload(null);
          }}
          onConfirm={handleConfirmDownload}
        />
      )}
      {editProduct && products?.length > 0 && (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-20">
          <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3 mb-4">
              {t("update_orders")}
            </h2>
            <form onSubmit={handleSubmit(handleUpdateSubmit)}>
              <div className="bg-muted/10 border-2 border-gray-300 dark:border-gray-700 p-5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 shadow-sm">
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    {t("product_name")}
                  </label>
                  <input
                    type="text"
                    value={editProduct.product_name || "N/A"}
                    disabled
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">{t("quantity")}</label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    {...register("quantity")}
                    min="1"
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
                    {t("unit_price")}
                  </label>
                  <input
                    type="number" onWheel={(event) => event.currentTarget.blur()}
                    {...register("unit_price")}
                    min="1"
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">{t("status")}</label>
                  <select
                    {...register("status")}
                    className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Done">{t("done")}</option>
                    <option value="Cancelled">{t("cancelled")}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg font-medium transition-colors"
                  onClick={() => setEditProduct(null)}
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
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-20">
          <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3 mb-4">{t("item_detail")}</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1 font-semibold text-sm text-muted-foreground">
                  {t("product_name")}
                </label>
                <p className="text-base font-semibold text-foreground">{selectedItem.product_name || "N/A"}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-sm text-muted-foreground">{t("quantity")}</label>
                <p className="text-base font-semibold text-foreground">{selectedItem.quantity}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-sm text-muted-foreground">{t("price")}</label>
                <p className="text-base font-semibold text-emerald-600">
                  Etb{" "}
                  {formatCurrency(
                    selectedItem.total_price
                      ? selectedItem.total_price
                      : selectedItem.price,
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="rounded-lg font-medium transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          }}
          className="hover:bg-emerald-600 transition-colors flex items-center justify-center font-bold text-lg"
        >
          ↑
        </button>
      )}
      <PDFModal
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        className="z-10"
      >
        <PDFViewer width="100%" height="600">
          <MyDoc
            orderFourDegit={orderFourDegit}
            order={selectedOrder}
            products={products}
            companyData={companyData}
            receiptData={receiptData}
          />
        </PDFViewer>
      </PDFModal>
      <PDFModal
        isOpen={showReceiptPosModal}
        onClose={() => setShowReceiptPosModal(false)}
        className="z-10"
      >
        <ReceiptPos receiptData={receiptPosData} />
      </PDFModal>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUpdate}
      />
      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOrderForStatus={selectedOrderForStatus}
      />
      <AddOrderModal
        isOpen={showAddOrderModal}
        onClose={closeModalAdd}
        selectedOrderId={selectedOrderId}
        id={selectedOrder?.id}
      />
      {showOrderLogModal && (
        <OrderLogsModal
          selectedRowOrder={selectedRowOrder}
          open={showOrderLogModal}
          onClose={closeModalOrderLog}
        />
      )}
      {showSelectedOrderPaymentStatusModal && (
        <OrderPaymentStatusModal
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          selectedRowPayment={selectedRowPayment}
          open={showSelectedOrderPaymentStatusModal}
          onClose={closeOrderPaymentStatus}
        />
      )}
    </div>
  );
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-md animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3 mb-4">
          {t("confirm_update")}
        </h2>
        <p className="text-muted-foreground mb-6">{t("do_you_to_update")}</p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-lg font-medium transition-colors"
          >
            {t("no")}
          </Button>
          <button
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t("yes")}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStatus,
  setSelectedStatus,
  selectedOrderForStatus,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-muted p-6 rounded-2xl shadow-xl w-[90%] lg:max-w-md animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-emerald-600 border-b border-emerald-500/10 pb-3">
          {t("update_status")}
        </h2>{" "}
        <div className="mb-4 mt-3 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg text-sm border border-emerald-500/10">
          <span className="font-semibold text-muted-foreground">Customer Name:</span>{" "}
          <span className="text-foreground font-semibold">
            {selectedOrderForStatus?.customer_name}
          </span>
        </div>
        <div className="mb-6">
          <label className="block mb-1.5 font-semibold text-sm text-muted-foreground">
            {t("status")}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg p-2.5 bg-transparent focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Done">{t("done")}</option>
            <option value="Cancelled">{t("cancelled")}</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-lg font-medium transition-colors"
          >
            {t("cancel")}
          </Button>
          <button
            onClick={onConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t("update")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCredit;

import { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
// import { PDFViewer } from "@react-pdf/renderer";
import {
  CreditCard,
  Eye,
  EyeOff,
  LayoutList,
  PackageCheck,
  Plus,
  Trash,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ConfirmOrderModal from "./ConfirmOrderModal.tsx";
// import MyDoc from "../components/OrderPdf.tsx";
import { submitOrderForm } from "../api/order";
import { getProducts } from "../../products/api/product";
import { getCompanyData } from "../../company/api/company";
import {
  getAllCustomers,
  submitCustomerForm,
} from "../../customers/api/customer";
import { CreateCustomerModal } from "@/features/customers/components/CreateCustomerModal.tsx";
import { formatCurrency } from "@/utils/numberFormaterStats.ts";

/*
const PDFModal = ({ isOpen, onClose, children, onPDFClose }) => {
  if (!isOpen) return null;
  const handleClose = () => {
    onClose();
    if (onPDFClose) {
      onPDFClose();
    }
  };
  return (
    <div className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};
*/

const AddOrder = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [fsNumber, setFsNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // PDF-related state kept unchanged, only PDF rendering is commented out
  const [orderResponseData, setOrderResponseData] = useState(null);
  const [orderNo, setOrderNo] = useState(null);

  const [items, setItems] = useState([
    {
      productInput: "",
      selectedProduct: null,
      quantity: 0,
      unit_price: "",
      // unit: "",
      package: null,
      disabledQuantity: false,
      disabledPackage: false,
      stock: 0,
    },
  ]);

  const [receipt] = useState("Receipt");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    tin_number: "",
    vat_number: "",
    zone: "",
    city: "",
    sub_city: "",
  });

  // PDF-related state kept unchanged
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPDFAtSubmit, setShowPDFAtSubmit] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);
  const { t } = useTranslation();
  const formatter = new Intl.NumberFormat("am-ET", {
    style: "currency",
    currency: "ETB",
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(
          Array.isArray(response?.all_results) ? response.all_results : []
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await getCompanyData();
        setCompanyData(response[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getAllCustomers();
        setCustomers(response);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    const customer = selectedOption ? selectedOption.value : null;
    setSelectedCustomer(customer);
    setPhoneNumber(customer ? customer.phone : "");
    setTinNumber(customer ? customer.tin_number : "");
    setFsNumber(customer ? customer.fs_number : "");
    setCustomerName(customer ? customer.name : "");
  };

  const handleProductChange = (index, selectedOption) => {
    const newItems = [...items];
    const selectedProduct = selectedOption ? selectedOption.value : null;
    newItems[index].productInput = selectedOption ? selectedOption.label : "";
    newItems[index].selectedProduct = selectedProduct;
    newItems[index].quantity = 0;
    newItems[index].package = null;
    newItems[index].selectedProduct
      ? (newItems[index].unit_price = selectedProduct.selling_price)
      : 0;
    // newItems[index].unit = selectedProduct ? selectedProduct.unit : "";
    newItems[index].stock = selectedProduct ? selectedProduct.stock : 0;
    setItems(newItems);
  };

  const handleQuantityChange = (index, event) => {
    const newItems = [...items];
    const quantity = event.target.value;
    newItems[index].quantity = quantity === "" ? 0 : parseInt(quantity, 10);
    newItems[index].disabledPackage = quantity !== "";
    setItems(newItems);
  };

  const handlePackageChange = (index, event) => {
    const newItems = [...items];
    const packageValue = event.target.value;
    newItems[index].package =
      packageValue === "" ? null : parseInt(packageValue, 10);
    newItems[index].disabledQuantity = packageValue !== "";
    setItems(newItems);
  };

  const handleUnitPriceChange = (index, event) => {
    const newItems = [...items];
    const unitPrice = event.target.value;
    newItems[index].unit_price = unitPrice === "" ? "" : parseFloat(unitPrice);
    setItems(newItems);
  };

  //
  const handleCustomerCreated = () => {
    // Refresh customers list
    const fetchCustomers = async () => {
      try {
        const response = await getAllCustomers();
        setCustomers(response);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productInput: "",
        selectedProduct: null,
        quantity: 0,
        unit_price: "",
        // unit: "",
        package: null,
        disabledQuantity: false,
        disabledPackage: false,
      },
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items
      .reduce((total, item) => {
        if (item.selectedProduct && (item.quantity > 0 || item.package)) {
          const quantity = item.package
            ? item.package * item.selectedProduct.piece
            : item.quantity;
          const unitPrice =
            item.unit_price || item.selectedProduct.selling_price;
          return total + unitPrice * quantity;
        }
        return total;
      }, 0)
      .toFixed(2);
  };

  const calculateVAT = () => {
    const subtotalWithReceipt = items
      .filter(
        (item) => item.selectedProduct && (item.quantity > 0 || item.package)
      )
      .reduce((total, item) => {
        const quantity = item.package
          ? item.package * item.selectedProduct.piece
          : item.quantity;
        const unitPrice = item.unit_price || item.selectedProduct.selling_price;
        return total + unitPrice * quantity;
      }, 0);
    return (subtotalWithReceipt * 0.15).toFixed(2);
  };

  const calculateTotalAmount = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const vat = parseFloat(calculateVAT());
    return (subtotal + vat).toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || showConfirmOrderModal) return;
    const hasSelectedProduct = items.some((item) => item.selectedProduct);
    if (!hasSelectedProduct) {
      toast.error("Please select at least one product.");
      return;
    }
    setShowConfirmOrderModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setShowConfirmOrderModal(false);
    const order = {
      customer: selectedCustomer ? selectedCustomer.id : null,
      total_amount: calculateTotalAmount(),
      phone_number: phoneNumber,
      tin_number: tinNumber,
      fs_number: fsNumber,
      receipt: receipt,
      items: items
        .filter(
          (item) =>
            item.selectedProduct && (item.quantity > 0 || item.package > 0)
        )
        .map((item) => ({
          product: item.selectedProduct.id,
          quantity: item.quantity,
          package: item.package,
          unit_price: item.unit_price || item.selectedProduct.selling_price,
          // unit: item.unit,
          price:
            (item.unit_price || item.selectedProduct.selling_price) *
            (item.package
              ? item.package * item.selectedProduct.piece
              : item.quantity),
        })),
    };
    try {
      const response = await submitOrderForm(order);
      if (response) {
        toast.success("Order made successfully!");
        resetForm();
        setOrderResponseData(response);
        setOrderNo(response.id);
        const fetchProducts = async () => {
          try {
            const response = await getProducts();
            setProducts(
              Array.isArray(response?.all_results)
                ? response.all_results
                : []
            );
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        };
        await fetchProducts();
        if (windowWidth < 768) {
          resetForm();
        } else {
          // PDF rendering temporarily disabled
          /*
          setShowPDFAtSubmit(true);
          setShowPDFModal(true);
          */
        }
      } else {
        toast.error("Failed to make order!");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = () => {
    setShowConfirmOrderModal(false);
  };

  const isFormDisabled = isSubmitting || showConfirmOrderModal;

  const resetForm = () => {
    setSelectedCustomer(null);
    setPhoneNumber("");
    setTinNumber("");
    setFsNumber("");
    setCustomerName("");
    setItems([
      {
        productInput: "",
        selectedProduct: null,
        quantity: 0,
        unit_price: "",
        // unit: "",
      },
    ]);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCustomer({
      name: "",
      phone: "",
      tin_number: "",
      vat_number: "",
      zone: "",
      city: "",
      sub_city: "",
    });
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value,
    });
  };

  const handleNewCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitCustomerForm(newCustomer);
      if (response) {
        toast.success("Customer added successfully!");
        closeModal();
        const fetchCustomers = async () => {
          try {
            const response = await getAllCustomers();
            setCustomers(response);
          } catch (error) {
            console.error("Error fetching customers:", error);
          }
        };
        fetchCustomers();
      } else {
        toast.error("Failed to add customer.");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding the customer.");
    }
  };

  const handleToggle = () => {
    setShowCustomerDetails((prev) => !prev);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-6xl mx-auto container mb-40">
      <div className="fixed top-0 right-0 h-full flex items-center z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-l-xl shadow-xl shadow-emerald-600/20 transition-all duration-200 flex items-center gap-2">
              <LayoutList className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px] p-0 bg-white border-l border-emerald-100 shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
              <SheetHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                  <LayoutList className="h-5 w-5" />
                </div>
                <SheetTitle className="text-xl font-bold text-emerald-700">
                  {t("order_summary")}
                </SheetTitle>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items
                .filter(
                  (item) =>
                    item.selectedProduct &&
                    (item.quantity > 0 || item.package)
                )
                .map((item, index) => {
                  const quantity = item.package
                    ? item.package * item.selectedProduct.piece
                    : item.quantity;
                  const unitPrice =
                    item.unit_price || item.selectedProduct.selling_price;
                  const totalPrice = quantity * unitPrice;
                  return (
                    <div
                      key={index}
                      className="w-full p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl hover:shadow-md hover:border-emerald-300 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-base font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {item.selectedProduct.name} - {item.selectedProduct.part_number ?? "N/A"}
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-md">
                          Qty: {quantity} × {formatter.format(unitPrice)}
                        </p>
                      </div>
                      <p className="text-right text-lg font-bold text-emerald-600">
                        {formatter.format(totalPrice)}
                      </p>
                    </div>
                  );
                })}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-emerald-100/50 space-y-4 mt-auto">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Number of Items
                </span>
                <span className="font-bold text-gray-800 bg-white px-3 py-1 rounded-lg border border-muted shadow-sm">
                  {
                    items.filter(
                      (item) =>
                        item.selectedProduct &&
                        (item.quantity > 0 || item.package)
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-semibold text-gray-800">
                  {formatter.format(calculateSubtotal())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  VAT (15%)
                </span>
                <span className="font-semibold text-gray-800">
                  {formatter.format(calculateVAT())}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-emerald-600 border-t border-emerald-200/50 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg">Total Amount</span>
                </div>
                <span className="text-2xl">
                  {formatter.format(calculateTotalAmount())}
                </span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10 flex justify-between items-center">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <PackageCheck className="h-6 w-6" />
            </div>
            {t("place_order")}
          </h2>
          <Button
            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border border-emerald-600/20 rounded-xl transition-all"
            onClick={openModal}
          >
            <Plus className="w-4 h-4 mr-2" /> {t("add_customers")}
          </Button>
        </div>

        <div className="p-6 md:p-8">
          <div className="w-full mb-10 min-h-screen">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div
                className={
                  isFormDisabled ? "pointer-events-none opacity-50" : ""
                }
              >
                <div className="space-y-2">
                  <label
                    htmlFor="customer-name"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    {t("customer_name")}
                  </label>
                  <Select
                    isClearable
                    id="customer-name"
                    options={
                      Array.isArray(customers)
                        ? customers.map((customer) => ({
                          label: customer.organization,
                          value: customer,
                        }))
                        : []
                    }
                    placeholder={t("select_customer_name")}
                    onChange={handleCustomerChange}
                    value={
                      selectedCustomer
                        ? {
                          label: selectedCustomer.organization,
                          value: selectedCustomer,
                        }
                        : null
                    }
                    className="w-full border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    isDisabled={isFormDisabled}
                  />
                </div>

                <div className="flex justify-end mb-0">
                  <Button
                    type="button"
                    onClick={handleToggle}
                    variant="outline"
                    size="icon"
                    className="border-muted-foreground/20 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    {showCustomerDetails ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {showCustomerDetails && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="tin-number"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                      >
                        {t("tin_number")}
                      </label>
                      <input
                        type="text"
                        id="tin-number"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="fs-number"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                      >
                        {t("fs_number")}
                      </label>
                      <input
                        type="text"
                        id="fs-number"
                        value={fsNumber}
                        onChange={(e) => setFsNumber(e.target.value)}
                        className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="phone-number"
                        className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                      >
                        {t("Phone_number")}
                      </label>
                      <input
                        type="text"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        readOnly
                      />
                    </div>
                  </>
                )}

                <div className="">
                  <div className="flex flex-col md:flex-row gap-4 mt-4"></div>

                  {items.map((item, index) => (
                    <div key={index} className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <label
                          htmlFor={`product-${index}`}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                        >
                          {t("product_name")}
                        </label>

                        <Select
                          isClearable
                          id={`product-${index}`}
                          value={
                            item.selectedProduct
                              ? {
                                label: `${item.selectedProduct.name} - ${item.selectedProduct.part_number ?? "N/A"
                                  }`,
                                value: item.selectedProduct,
                              }
                              : null
                          }
                          onChange={(selectedOption) =>
                            handleProductChange(index, selectedOption)
                          }
                          options={
                            Array.isArray(products)
                              ? products.map((product) => ({
                                label: `${product.name} - ${product.part_number ?? "N/A"
                                  }`,
                                value: product,
                              }))
                              : []
                          }
                          placeholder={t("select_product")}
                          className="w-full border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                          isDisabled={isFormDisabled}
                        />
                      </div>

                      {item.selectedProduct && (
                        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                          {/* <div className="space-y-2">
                          <label
                            htmlFor={`unit-${index}`}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                          >
                            Unit
                          </label>
                          <input
                            type="text"
                            id={`unit-${index}`}
                            value={item.unit}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].unit = e.target.value;
                              setItems(newItems);
                            }}
                            className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div> */}

                          <div className="space-y-2">
                          <label
                            htmlFor={`package-${index}`}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                          >
                            Package
                          </label>
                          <input
                            type="number" onWheel={(event) => event.currentTarget.blur()}
                            id={`package-${index}`}
                            value={item.package || ""}
                            onChange={(e) => handlePackageChange(index, e)}
                            className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            disabled={item.disabledPackage}
                          />
                        </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`unit-price-${index}`}
                              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                            >
                              {t("unit_price")}
                            </label>

                            <input
                              type="number" onWheel={(event) => event.currentTarget.blur()}
                              id={`unit-price-${index}`}
                              value={item.unit_price}
                              onChange={(e) =>
                                handleUnitPriceChange(index, e)
                              }
                              className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-row justify-between">
                              <label
                                htmlFor={`quantity-${index}`}
                                className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                              >
                                {t("quantity")}
                              </label>

                              <span
                                className={`text-xs font-bold tracking-widest ${item.stock > 0
                                    ? "text-emerald-600"
                                    : "text-red-500"
                                  }`}
                              >
                                Stock available: {item.stock}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="number" onWheel={(event) => event.currentTarget.blur()}
                                id={`quantity-${index}`}
                                min="1"
                                required
                                value={
                                  item.quantity === 0 ? "" : item.quantity
                                }
                                onChange={(e) =>
                                  handleQuantityChange(index, e)
                                }
                                className="p-3 w-full bg-muted/20 border border-muted-foreground/20 rounded-xl shadow-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                disabled={item.disabledQuantity}
                              />
                            </div>
                          </div>

                          {/* Total Price */}
                          <div>
                            <label
                              htmlFor={`totalPrice-${index}`}
                              className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-1.5"
                            >
                              {t("total_price")}
                            </label>

                            <input
                              type="text"
                              id={`totalPrice-${index}`}
                              value={formatCurrency(
                                item.quantity * item.unit_price
                              )}
                              disabled
                              className={`w-full h-11 px-3 rounded-xl bg-white dark:bg-gray-800 border focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all outline-none`}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        {items.length > 1 && (
                          <Button
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all"
                            type="button"
                            variant="outline"
                            onClick={() => removeItem(index)}
                            disabled={isFormDisabled}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            {t("remove")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-muted">
                  {items.length > 0 && (
                    <Button
                      type="button"
                      onClick={addItem}
                      disabled={isFormDisabled}
                      className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 border border-emerald-600/20 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("add_more")}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    disabled={isFormDisabled}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[150px]"
                  >
                    <PackageCheck className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : t("submit_order")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateCustomerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCustomerCreated={handleCustomerCreated}
        />
      )}

      {showConfirmOrderModal && (
        <ConfirmOrderModal
          isOpen={showConfirmOrderModal}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
          isSubmitting={isSubmitting}
        />
      )}

      {/*
      {showPDFModal && showPDFAtSubmit && (
        <PDFModal
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false);
            resetForm();
          }}
          onPDFClose={resetForm}
        >
          <PDFViewer width="100%" height="600">
            <MyDoc
              orderNo={orderNo}
              order={
                orderResponseData || {
                  customer: selectedCustomer,
                  fs_number: fsNumber,
                  items: items
                    .filter(
                      (item) =>
                        (item.selectedProduct && item.quantity) ||
                        item.package > 0
                    )
                    .map((item) => ({
                      product: item.selectedProduct.id,
                      product_name: item.selectedProduct.name,
                      // product_unit: item.selectedProduct.unit,
                      quantity:
                        item.quantity ||
                        item.package * item.selectedProduct.piece,
                      unit_price:
                        item.unit_price || item.selectedProduct.selling_price,
                      price:
                        (item.unit_price ||
                          item.selectedProduct.selling_price) * item.quantity,
                      receipt: receipt,
                    })),
                  subtotal: calculateSubtotal(),
                  vat: calculateVAT(),
                  total_amount: calculateTotalAmount(),
                }
              }
              // itemsUnit={items.map((item) => item.unit)}
              products={products}
              companyData={companyData}
              receiptData={{
                customer: selectedCustomer,
                items: items
                  .filter(
                    (item) => item.selectedProduct && item.quantity > 0
                  )
                  .map((item) => ({
                    product_name: item.selectedProduct.name,
                    // product_unit: item.selectedProduct.unit,
                    quantity: item.quantity,
                    unit_price:
                      item.unit_price || item.selectedProduct.selling_price,
                    price:
                      (item.unit_price ||
                        item.selectedProduct.selling_price) * item.quantity,
                    receipt: receipt,
                  })),
              }}
            />
          </PDFViewer>
        </PDFModal>
      )}
      */}
    </div>
  );
};

export default AddOrder;

// @ts-nocheck
// src/App.tsx
import { Navigate, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { AbilityProvider } from "@/context/AbilityContext";
import { Can } from "@/components/Can";
import { fetchUserProfile } from "@/features/accounts/api/user.ts";
import useUserStore from "@/stores/useUserStore.ts";
import { Spinner } from "./components/ui/spinner.tsx";

// Normal imports
import Dashboard from "./features/dashboard/pages/Dashboard";
import Login from "./features/login/page/Login";
import MainLayout from "./components/layout/MainLayout/MainLayout";

// Customer components
import AddCustomer from "@/features/customers/pages/AddCustomer.tsx";
import ManageCustomer from "./features/customers/pages/ManageCustomer";

// Order components
import AddOrder from "@/features/order/pages/AddOrder.tsx";
import AddCredit from "@/features/order/pages/AddCredit.tsx";
import ManageOrder from "@/features/order/pages/ManageOrder.tsx";
import ExportPage from "@/features/order/pages/Export.tsx";
import ManageCredit from "@/features/order/pages/ManageCredit.tsx";

// Product components
import AddProduct from "@/features/products/AddProduct.tsx";
import ManageProduct from "@/features/products/ManageProduct.tsx";

// Category components
import AddCategory from "@/features/categories/pages/AddCategory.tsx";
import ManageCategory from "@/features/categories/pages/ManageCategory.tsx";

// Supplier components
import AddSupplier from "@/features/suppliers/pages/AddSupplier.tsx";
import ManageSupplier from "@/features/suppliers/pages/ManageSupplier.tsx";

// Service components
import AddService from "./features/services/pages/AddService";
import ManageServices from "./features/services/pages/ManageService";

// Vehicle components
import AddVehicle from "./features/vehicle/pages/AddVehicle.tsx";
import ManageVehicle from "./features/vehicle/pages/ManageVehicle.tsx";

// Service Package components
import AddServicePackage from "./features/servicePackage/pages/AddServicePackage";
import ManageServicePackages from "./features/servicePackage/pages/ManageServicePackage";

// Job Card components
import AddJobCard from "./features/jobCard/pages/AddJobCard";
import ManageJobCard from "./features/jobCard/pages/ManageJobCard";
import ViewJobCardDetail from "@/features/jobCard/pages/ViewJobCardDetail.tsx";
import UpdateJobCard from "@/features/jobCard/pages/UpdateJobCard.tsx";

// Invoice components
import Invoice from "@/features/invoice/pages/Invoice.tsx";
import ManageInvoice from "@/features/invoice/pages/ManageInvoice.tsx";
import ViewInvoiceDetail from "@/features/invoice/pages/ViewInvoiceDetail.tsx";
import InvoiceUpdatePage from "@/features/invoice/pages/InvoiceUpdatePage.tsx";

// Performa components
import Performa from "@/features/perfomra/pages/Performa.tsx";
import ManagePerforma from "@/features/perfomra/pages/MangePerforma.tsx";
import PerformaDetailPage from "@/features/perfomra/pages/PerformaDetailPage.tsx";
import AddCustomerPerformaPage from "@/features/perfomra/pages/AddCustomerPerformaPage.tsx";

// Purchase components
import PurchaseProduct from "@/features/purchase/pages/PurchaseProduct.tsx";
import PurchaseExpense from "@/features/purchase/pages/PurchaseExpense.tsx";
import ExpenseDetailPage from "@/features/purchase/pages/ExpenseDetailPage.tsx";

// Customer Purchase components
import CustomerPurchaseProduct from "@/features/customer-purchase/pages/CustomerPurchaseProduct.tsx";
import CustomerPurchaseExpense from "@/features/customer-purchase/pages/CustomerPurchaseExpense.tsx";
import CustomerExpenseDetailPage from "@/features/customer-purchase/pages/CustomerExpenseDetailPage.tsx";

// Vehicle Part Request components
import AddVehiclePartRequest from "./features/VehiclePartRequest/pages/AddVehiclePartRequest";
import ManageVehiclePartRequest from "@/features/VehiclePartRequest/pages/ManageVehiclePartRequest.tsx";
import VehiclePartRequestLog from "./features/VehiclePartRequest/pages/VehiclePartRequestLog";
import ViewPartRequestDetail from "@/features/VehiclePartRequest/pages/ViewPartRequestDetail.tsx";
import UpdatePartRequest from "@/features/VehiclePartRequest/pages/UpdatePartRequest.tsx";

// Vehicle Acceptance components
import AddVehicleAcceptance from "./features/vehicleAcceptance/pages/AddVehicleAcceptance";
import ManageVehicleAcceptance from "./features/vehicleAcceptance/pages/ManageVehicleAcceptance";
import ViewVehicleAcceptanceDetails from "./features/vehicleAcceptance/pages/ViewVehicleAcceptanceDetails";
import UpdateVehicleAcceptance from "./features/vehicleAcceptance/components/UpdateVehicleAcceptance";

// Vehicle Old Part components
import AddVehicleOldPartDelivery from "./features/VehicleOldPartDelivery/pages/AddVehicleOldPartDelivery";
import ManageVehicleOldPartDelivery from "@/features/VehicleOldPartDelivery/pages/ManageVehicleOldPartDelivery.tsx";
import ViewVehicleOldPartDetail from "@/features/VehicleOldPartDelivery/pages/ViewVehicleOldPartDetail.tsx";
import UpdateOldPartDelivery from "@/features/VehicleOldPartDelivery/pages/UpdateOldPartDelivery.tsx";
import UpdateVehicleOldPartDelivery from "@/features/VehicleOldPartDelivery/pages/UpdateVehicleOldPartDelivery";
import VehilceOldPartDeliveryLog from "./features/VehicleOldPartDelivery/pages/VehilceOldPartDeliveryLog.tsx";

// Vehicle Order Voucher components
import AddVehicleOrderVoucher from "./features/vehicleOrderVoucher/pages/AddVehicleOrderVoucher";
import ManageVehicleOrderVoucher from "@/features/vehicleOrderVoucher/pages/ManageVehicleOrderVoucher.tsx";
import VehicleOrderVoucherLog from "./features/vehicleOrderVoucher/pages/VehicleOrderVoucherLog.tsx";
import ViewVehicleOrderVoucherDetail from "./features/vehicleOrderVoucher/pages/ViewVehicleOrderVoucherDetail.tsx";
import UpdateVehicleOrderVoucher from "./features/vehicleOrderVoucher/pages/UpdateVehicleOrderVoucher.tsx";

// Task and other components
import Tasks from "@/features/myTasks/pages/tasks.tsx";
import TechnicalExaminer from "@/features/technicalExaminer/pages/TechnicalExaminer.tsx";
import Accounts from "./features/accounts/pags/Accounts";
import Profile from "@/features/accounts/pags/Profile.tsx";
import CompanyInfo from "@/features/company/page/CompanyInfo.tsx";

// Protected Route Component
const ProtectedRoute = ({
  children,
  action,
  subject,
}: {
  children: JSX.Element;
  action: string;
  subject: string;
}) => {
  return (
    <Can I={action} this={subject}>
      {children}
    </Can>
  );
};

const App = () => {
  const { setUser, user } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const users = await fetchUserProfile();
        setUser({
          email: users?.data?.email,
          name: users?.data?.name,
          role: users?.data?.role,
        });
      } catch (error) {
        console.error("Failed to fetch users:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [setUser]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {user?.role ? (
          <Route
            path="*"
            element={
              <AbilityProvider
                role={user.role}
                key={user.role}
              >
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<MainLayout />}>
                    {/* Dashboard - Always visible */}
                    <Route index element={<Dashboard />} />

                    {/* Customer Routes */}
                    <Route
                      path="/add-customer"
                      element={
                        <ProtectedRoute action="create" subject="Customer">
                          <AddCustomer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-customer"
                      element={
                        <ProtectedRoute action="manage" subject="Customer">
                          <ManageCustomer />
                        </ProtectedRoute>
                      }
                    />

                    {/* Order Routes */}
                    <Route
                      path="/order"
                      element={
                        <ProtectedRoute action="create" subject="Order">
                          <AddOrder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/credit"
                      element={
                        <ProtectedRoute action="create" subject="Order">
                          <AddCredit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-order"
                      element={
                        <ProtectedRoute action="manage" subject="Order">
                          <ManageOrder />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/report"
                      element={
                        <ProtectedRoute action="manage" subject="Report">
                          <ExportPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/manage_credit"
                      element={
                        <ProtectedRoute action="manage" subject="Credit">
                          <ManageCredit />
                        </ProtectedRoute>
                      }
                    />

                    {/* Product Routes */}
                    <Route
                      path="/add-product"
                      element={
                        <ProtectedRoute action="create" subject="Product">
                          <AddProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-product"
                      element={
                        <ProtectedRoute action="manage" subject="Product">
                          <ManageProduct />
                        </ProtectedRoute>
                      }
                    />

                    {/* Category Routes */}
                    <Route
                      path="add-category"
                      element={
                        <ProtectedRoute action="create" subject="Category">
                          <AddCategory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="manage-category"
                      element={
                        <ProtectedRoute action="manage" subject="Category">
                          <ManageCategory />
                        </ProtectedRoute>
                      }
                    />

                    {/* Supplier Routes */}
                    <Route
                      path="add-supplier"
                      element={
                        <ProtectedRoute action="create" subject="Supplier">
                          <AddSupplier />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="manage-supplier"
                      element={
                        <ProtectedRoute action="manage" subject="Supplier">
                          <ManageSupplier />
                        </ProtectedRoute>
                      }
                    />

                    {/* Service Routes */}
                    <Route
                      path="/add-service"
                      element={
                        <ProtectedRoute action="create" subject="Service">
                          <AddService />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-services"
                      element={
                        <ProtectedRoute action="manage" subject="Service">
                          <ManageServices />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vehicle Routes */}
                    <Route
                      path="/add-vehicle"
                      element={
                        <ProtectedRoute action="create" subject="Vehicle">
                          <AddVehicle />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-vehicles"
                      element={
                        <ProtectedRoute action="manage" subject="Vehicle">
                          <ManageVehicle />
                        </ProtectedRoute>
                      }
                    />

                    {/* Service Package Routes */}
                    <Route
                      path="/add-service-package"
                      element={
                        <ProtectedRoute action="create" subject="ServicePackage">
                          <AddServicePackage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-service-package"
                      element={
                        <ProtectedRoute action="manage" subject="ServicePackage">
                          <ManageServicePackages />
                        </ProtectedRoute>
                      }
                    />

                    {/* Job Card Routes */}
                    <Route
                      path="/add-job-card"
                      element={
                        <ProtectedRoute action="create" subject="JobCard">
                          <AddJobCard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-job-card"
                      element={
                        <ProtectedRoute action="manage" subject="JobCard">
                          <ManageJobCard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/job-card/:id"
                      element={
                        <ProtectedRoute action="read" subject="JobCard">
                          <ViewJobCardDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-job-card/:id"
                      element={
                        <ProtectedRoute action="update" subject="JobCard">
                          <UpdateJobCard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Invoice Routes */}
                    <Route
                      path="/invoice"
                      element={
                        <ProtectedRoute action="create" subject="Invoice">
                          <Invoice />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-invoice"
                      element={
                        <ProtectedRoute action="manage" subject="Invoice">
                          <ManageInvoice />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices/view/:id"
                      element={
                        <ProtectedRoute action="read" subject="Invoice">
                          <ViewInvoiceDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/invoices/update/:id"
                      element={
                        <ProtectedRoute action="update" subject="Invoice">
                          <InvoiceUpdatePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Performa Routes */}
                    <Route
                      path="/performa"
                      element={
                        <ProtectedRoute action="create" subject="Performa">
                          <Performa />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-performa"
                      element={
                        <ProtectedRoute action="manage" subject="Performa">
                          <ManagePerforma />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/performa-detail"
                      element={
                        <ProtectedRoute action="read" subject="Performa">
                          <PerformaDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-customer-performa"
                      element={
                        <ProtectedRoute action="create" subject="Performa">
                          <AddCustomerPerformaPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Purchase Routes */}
                    <Route
                      path="/add-purchase"
                      element={
                        <ProtectedRoute action="create" subject="Purchase">
                          <PurchaseProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-purchase"
                      element={
                        <ProtectedRoute action="manage" subject="Purchase">
                          <PurchaseExpense />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/expense-detail"
                      element={
                        <ProtectedRoute action="read" subject="Purchase">
                          <ExpenseDetailPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Customer Purchase Routes */}
                    <Route
                      path="/add-customer-purchase"
                      element={
                        <ProtectedRoute action="create" subject="CustomerPurchase">
                          <CustomerPurchaseProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-customer-purchase"
                      element={
                        <ProtectedRoute action="manage" subject="CustomerPurchase">
                          <CustomerPurchaseExpense />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer-expense-detail"
                      element={
                        <ProtectedRoute action="read" subject="CustomerPurchase">
                          <CustomerExpenseDetailPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vehicle Part Request Routes */}
                    <Route
                      path="/add-vehicle-part-request"
                      element={
                        <ProtectedRoute action="create" subject="VehiclePartRequest">
                          <AddVehiclePartRequest />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-vehicle-part-request"
                      element={
                        <ProtectedRoute action="manage" subject="VehiclePartRequest">
                          <ManageVehiclePartRequest />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-part-request-log"
                      element={
                        <ProtectedRoute action="manage" subject="VehiclePartRequest">
                          <VehiclePartRequestLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-part-request/:id"
                      element={
                        <ProtectedRoute action="update" subject="VehiclePartRequest">
                          <UpdatePartRequest />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/part-request-detail/:id"
                      element={
                        <ProtectedRoute action="read" subject="VehiclePartRequest">
                          <ViewPartRequestDetail />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vehicle Acceptance Routes */}
                    <Route
                      path="/add-vehicle-acceptance"
                      element={
                        <ProtectedRoute action="create" subject="VehicleAcceptance">
                          <AddVehicleAcceptance />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-vehicle-acceptance"
                      element={
                        <ProtectedRoute action="manage" subject="VehicleAcceptance">
                          <ManageVehicleAcceptance />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-acceptance/:id"
                      element={
                        <ProtectedRoute action="read" subject="VehicleAcceptance">
                          <ViewVehicleAcceptanceDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-vehicle-acceptance/:id"
                      element={
                        <ProtectedRoute action="update" subject="VehicleAcceptance">
                          <UpdateVehicleAcceptance />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vehicle Old Part Routes */}
                    <Route
                      path="/add-vehicle-old-part-delivery"
                      element={
                        <ProtectedRoute action="create" subject="VehicleOldPart">
                          <AddVehicleOldPartDelivery />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-vehicle-old-part"
                      element={
                        <ProtectedRoute action="manage" subject="VehicleOldPart">
                          <ManageVehicleOldPartDelivery />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-old-part-delivery-log"
                      element={
                        <ProtectedRoute action="manage" subject="VehicleOldPart">
                          <VehilceOldPartDeliveryLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-old-part-detail/:id"
                      element={
                        <ProtectedRoute action="read" subject="VehicleOldPart">
                          <ViewVehicleOldPartDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/update-vehicle-old-part-delivery/:id"
                      element={
                        <ProtectedRoute action="update" subject="VehicleOldPart">
                          <UpdateVehicleOldPartDelivery />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vehicle Order Voucher Routes */}
                    <Route
                      path="/add-vehicle-order-voucher"
                      element={
                        <ProtectedRoute action="create" subject="VehicleOrderVoucher">
                          <AddVehicleOrderVoucher />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manage-vehicle-order-voucher"
                      element={
                        <ProtectedRoute action="manage" subject="VehicleOrderVoucher">
                          <ManageVehicleOrderVoucher />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-order-voucher-log"
                      element={
                        <ProtectedRoute action="manage" subject="VehicleOrderVoucher">
                          <VehicleOrderVoucherLog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/vehicle-order-voucher-detail/:id"
                      element={
                        <ProtectedRoute action="read" subject="VehicleOrderVoucher">
                          <ViewVehicleOrderVoucherDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="update-vehicle-order-voucher/:id"
                      element={
                        <ProtectedRoute action="update" subject="VehicleOrderVoucher">
                          <UpdateVehicleOrderVoucher />
                        </ProtectedRoute>
                      }
                    />

                    {/* Task Routes */}
                    <Route
                      path="/my-tasks"
                      element={
                        <ProtectedRoute action="read" subject="Task">
                          <Tasks />
                        </ProtectedRoute>
                      }
                    />

                    {/* Technical Examiner Routes */}
                    <Route
                      path="/technicalExaminer"
                      element={
                        <ProtectedRoute action="read" subject="TechnicalExaminer">
                          <TechnicalExaminer />
                        </ProtectedRoute>
                      }
                    />

                    {/* Settings Routes */}
                    <Route
                      path="/accounts"
                      element={
                        <ProtectedRoute action="read" subject="Profile">
                          <Accounts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute action="read" subject="Profile">
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/company-info"
                      element={
                        <ProtectedRoute action="read" subject="CompanyInfo">
                          <CompanyInfo />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </AbilityProvider>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;

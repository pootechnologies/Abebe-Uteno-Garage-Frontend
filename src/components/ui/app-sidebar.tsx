// src/components/layout/AppSidebar.tsx
import React from "react";
import {
  Bot,
  Briefcase,
  Calendar,
  Car,
  Lightbulb,
  ClipboardList,
  Home,
  Inbox,
  Package,
  Settings,
  Tag,
  Truck,
  CreditCard,
  BarChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/ui/nav-main";
import { NavUser } from "@/components/ui/nav-user";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { useAbility } from "../../../src/context/AbilityContext";
import { TeamSwitcher } from "./team-switcher";
import { subject } from "@casl/ability";

const data = {
  teams: [
    {
      name: "Po'o Technologies",
      logo: Lightbulb,
      plan: "Software Services",
    },
  ],
};

const menuItems = [
  {
    title: "dashboard",
    url: "/",
    icon: Home,
    subject: "Dashboard",
  },
  {
    title: "customers",
    icon: Inbox,
    subject: "Customer",
    subItems: [
      {
        title: "add_customers",
        url: "/add-customer",
        subject: "Customer",
        action: "create",
      },
      {
        title: "manage_customers",
        url: "/manage-customer",
        subject: "Customer",
        action: "manage",
      },
    ],
  },
  {
    title: "vehicles",
    icon: Car,
    subject: "Vehicle",
    subItems: [
      {
        title: "add_vehicle",
        url: "/add-vehicle",
        subject: "Vehicle",
        action: "create",
      },
      {
        title: "manage_vehicles",
        url: "/manage-vehicles",
        subject: "Vehicle",
        action: "manage",
      },
    ],
  },
  {
    title: "categories",
    url: "#",
    icon: Tag,
    subject: "Category",
    subItems: [
      {
        title: "add_categories",
        url: "/add-category",
        subject: "Category",
        action: "create",
      },
      {
        title: "manage_categories",
        url: "/manage-category",
        subject: "Category",
        action: "manage",
      },
    ],
  },
  {
    title: "suppliers",
    url: "#",
    icon: Truck,
    subject: "Supplier",
    subItems: [
      {
        title: "add_suppliers",
        url: "/add-supplier",
        subject: "Supplier",
        action: "create",
      },
      {
        title: "manage_suppliers",
        url: "/manage-supplier",
        subject: "Supplier",
        action: "manage",
      },
    ],
  },
  {
    title: "products",
    url: "#",
    icon: Package,
    subject: "Product",
    subItems: [
      {
        title: "add_products",
        url: "/add-product",
        subject: "Product",
        action: "create",
      },
      {
        title: "manage_products",
        url: "/manage-product",
        subject: "Product",
        action: "manage",
      },
    ],
  },
  {
    title: "orders",
    icon: Inbox,
    subject: "Order",
    subItems: [
      {
        title: "place_order",
        url: "/order",
        subject: "Order",
        action: "create",
      },

      {
        title: "manage_orders",
        url: "/manage-order",
        subject: "Order",
        action: "manage",
      },
    ],
  },

  {
    title: "credits",
    icon: Bot,
    subject: "CustomerPurchase",
    subItems: [
      {
        title: "place_credit",
        url: "/add-customer-purchase",
        subject: "CustomerPurchase",
        action: "create",
      },
      {
        title: "manage_credit",
        url: "/manage-customer-purchase",
        subject: "CustomerPurchase",
        action: "manage",
      },
    ],
  },

  {
    title: "reports",
    icon: BarChart,
    subject: "Report",
    subItems: [
      {
        title: "export_report",
        url: "/report",
        subject: "Report",
        action: "create",
      },
    ],
  },

  {
    title: "services",
    icon: Briefcase,
    subject: "Service",
    subItems: [
      {
        title: "add_service",
        url: "/add-service",
        subject: "Service",
        action: "create",
      },
      {
        title: "manage_services",
        url: "/manage-services",
        subject: "Service",
        action: "manage",
      },
    ],
  },
  {
    title: "service_packages",
    icon: Package,
    subject: "ServicePackage",
    subItems: [
      {
        title: "add_service_package",
        url: "/add-service-package",
        subject: "ServicePackage",
        action: "create",
      },
      {
        title: "manage_service_package",
        url: "/manage-service-package",
        subject: "ServicePackage",
        action: "manage",
      },
    ],
  },
  {
    title: "vehicle_acceptance",
    icon: Calendar,
    subject: "VehicleAcceptance",
    subItems: [
      {
        title: "add_vehicle_acceptance",
        url: "/add-vehicle-acceptance",
        subject: "VehicleAcceptance",
        action: "create",
      },
      {
        title: "manage_vehicle_acceptance",
        url: "/manage-vehicle-acceptance",
        subject: "VehicleAcceptance",
        action: "manage",
      },
    ],
  },
  {
    title: "job_card",
    icon: Briefcase,
    subject: "JobCard",
    subItems: [
      {
        title: "add_job_card",
        url: "/add-job-card",
        subject: "JobCard",
        action: "create",
      },
      {
        title: "manage_job_cards",
        url: "/manage-job-card",
        subject: "JobCard",
        action: "manage",
      },
    ],
  },
  // {
  //   title: "vehicle_orders_voucher",
  //   icon: ClipboardList,
  //   subject: "VehicleOrderVoucher",
  //   subItems: [
  //     {
  //       title: "add_vehicle_order_voucher",
  //       url: "/add-vehicle-order-voucher",
  //       subject: "VehicleOrderVoucher",
  //       action: "create",
  //     },
  //     {
  //       title: "manage_vehicle_order_voucher",
  //       url: "/manage-vehicle-order-voucher",
  //       subject: "VehicleOrderVoucher",
  //       action: "manage",
  //     },
  //     {
  //       title: "vehicle_order_voucher_log",
  //       url: "/vehicle-order-voucher-log",
  //       subject: "VehicleOrderVoucher",
  //       action: "manage",
  //     },
  //   ],
  // },
  {
    title: "vehicle_part_request",
    icon: Briefcase,
    subject: "VehiclePartRequest",
    subItems: [
      {
        title: "add_vehicle_part_request",
        url: "/add-vehicle-part-request",
        subject: "VehiclePartRequest",
        action: "create",
      },
      {
        title: "manage_vehicle_part_requests",
        url: "/manage-vehicle-part-request",
        subject: "VehiclePartRequest",
        action: "manage",
      },
      {
        title: "vehicle_part_request_log",
        url: "/vehicle-part-request-log",
        subject: "VehiclePartRequest",
        action: "read",
      },
    ],
  },
  {
    title: "vehicle_old_part",
    icon: Briefcase,
    subject: "VehicleOldPart",
    subItems: [
      {
        title: "add_vehicle_old_part",
        url: "/add-vehicle-old-part-delivery",
        subject: "VehicleOldPart",
        action: "create",
      },
      {
        title: "manage_vehicle_old_part",
        url: "/manage-vehicle-old-part",
        subject: "VehicleOldPart",
        action: "manage",
      },
      {
        title: "vehicle_old_part_delivery_log",
        url: "/vehicle-old-part-delivery-log",
        subject: "VehicleOldPart",
        action: "manage",
      },
    ],
  },
  {
    title: "invoice",
    icon: Briefcase,
    subject: "Invoice",
    subItems: [
      {
        title: "add_invoice",
        url: "/invoice",
        subject: "Invoice",
        action: "create",
      },
      {
        title: "manage_invoices",
        url: "/manage-invoice",
        subject: "Invoice",
        action: "manage",
      },
    ],
  },
  {
    title: "performa",
    icon: Bot,
    subject: "Performa",
    subItems: [
      {
        title: "add_performa",
        url: "/performa",
        subject: "Performa",
        action: "create",
      },
      {
        title: "manage_performa",
        url: "/manage-performa",
        subject: "Performa",
        action: "manage",
      },
    ],
  },
  {
    title: "purchase",
    icon: Bot,
    subject: "Purchase",
    subItems: [
      {
        title: "add_purchase",
        url: "/add-purchase",
        subject: "Purchase",
        action: "create",
      },
      {
        title: "manage_purchase",
        url: "/manage-purchase",
        subject: "Purchase",
        action: "manage",
      },
    ],
  },
  {
    title: "task",
    icon: Briefcase,
    subject: "Task",
    subItems: [
      { title: "my_tasks", url: "/my-tasks", subject: "Task", action: "read" },
    ],
  },
  {
    title: "technical_examiner",
    icon: Briefcase,
    subject: "TechnicalExaminer",
    subItems: [
      {
        title: "examiner",
        url: "/technicalExaminer",
        subject: "TechnicalExaminer",
        action: "read",
      },
    ],
  },
  {
    title: "settings",
    url: "#",
    icon: Settings,
    subject: "Settings",
    subItems: [
      {
        title: "accounts",
        url: "/accounts",
        subject: "Accounts",
        action: "read",
      },
      {
        title: "profile",
        url: "/profile",
        subject: "Profile",
        action: "read",
      },
      {
        title: "company_profile",
        url: "/company-info",
        subject: "CompanyInfo",
        action: "read",
      },
    ],
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const ability = useAbility();

  React.useEffect(() => {
    if (location.pathname === "/" && !ability.can("read", "Dashboard")) {
      // Do not redirect Field Operator to /my-tasks
      if (user?.role !== "Field Operator") {
        navigate("/my-tasks", { replace: true });
      }
    }
  }, [location.pathname, ability, navigate, user?.role]);

  let filteredMenuItems = [];
  if (user?.role === "Customer Officer") {
    filteredMenuItems = menuItems
      .map((item) => {
        const allowed = ["Dashboard", "Performa", "Supplier", "Settings", "Product", "Order", "Category", "Credit", "Purchase", "CustomerPurchase", "Invoice", "VehiclePartRequest"];
        if (!allowed.includes(item.subject)) return null;
        if (item.subject === "Settings" && item.subItems) {
          const profileOnly = item.subItems.filter(
            (sub) => sub.subject === "Profile",
          );
          return { ...item, subItems: profileOnly };
        }
        return item;
      })
      .filter(Boolean);
  } else if (user?.role === "Cashier") {
    filteredMenuItems = menuItems
      .map((item) => {
        const allowed = ["Dashboard", "Order", "Invoice", "Settings", "CustomerPurchase"];
        if (!allowed.includes(item.subject)) return null;
        if (item.subject === "Order" && item.subItems) {
          const manageOrdersOnly = item.subItems.filter(
            (sub) => sub.title === "manage_orders",
          );
          return { ...item, subItems: manageOrdersOnly };
        }
        if (item.subject === "Settings" && item.subItems) {
          const profileOnly = item.subItems.filter(
            (sub) => sub.subject === "Profile",
          );
          return { ...item, subItems: profileOnly };
        }
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) =>
            ability.can(sub.action, sub.subject),
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter(Boolean);
  } else if (user?.role === "Manager" || user?.role === "Assistant Manager") {
    // For Manager and Assistant Manager, exclude the "Task" item
    filteredMenuItems = menuItems
      .map((item) => {
        if (item.subject === "Task") return null;
        const canAccessMainItem =
          item.subject === "Dashboard"
            ? ability.can("read", "Dashboard")
            : ability.can("read", item.subject) ||
            ability.can("manage", item.subject);
        if (!canAccessMainItem) return null;
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) =>
            ability.can(sub.action, sub.subject),
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter(Boolean);
  } else if (user?.role === "Field Operator") {
    filteredMenuItems = menuItems
      .map((item) => {
        const allowed = [
          "Dashboard",
          "VehicleAcceptance",
          "VehicleOldPart",
          "Settings",
        ];
        if (!allowed.includes(item.subject)) return null;
        if (item.subject === "Settings" && item.subItems) {
          const profileOnly = item.subItems.filter(
            (sub) => sub.subject === "Profile",
          );
          return { ...item, subItems: profileOnly };
        }
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) =>
            ability.can(sub.action, sub.subject),
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter(Boolean);
  } else {
    // Default logic for other roles
    filteredMenuItems = menuItems
      .map((item) => {
        const canAccessMainItem =
          item.subject === "Dashboard"
            ? ability.can("read", "Dashboard")
            : ability.can("read", item.subject) ||
            ability.can("manage", item.subject);
        if (!canAccessMainItem) return null;
        if (item.subject === "Settings" && item.subItems) {
          const profileOnly = item.subItems.filter(
            (sub) => sub.subject === "Profile",
          );
          return { ...item, subItems: profileOnly };
        }
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((sub) =>
            ability.can(sub.action, sub.subject),
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter(Boolean);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredMenuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

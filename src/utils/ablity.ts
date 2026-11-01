import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type MongoQuery,
} from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update";
export type Subjects =
  | "all"
  | "Dashboard"
  | "Accounts"
  | "Customer"
  | "Order"
  | "Credit"
  | "Report"
  | "Product"
  | "Category"
  | "Supplier"
  | "Service"
  | "Vehicle"
  | "JobCard"
  | "Invoice"
  | "Performa"
  | "Purchase"
  | "CustomerPurchase"
  | "VehicleAcceptance"
  | "VehiclePartRequest"
  | "VehicleOrderVoucher"
  | "VehicleOldPart"
  | "ServicePackage"
  | "Task"
  | "TechnicalExaminer"
  | "Profile"
  | "CompanyInfo"
  | "Settings";

export type AppAbilities = [Actions, Subjects];
export type AppAbility = MongoAbility<AppAbilities, MongoQuery>;

export function defineAbilitiesFor(role: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  switch (role) {
    case "Manager":
    case "Assistant Manager":
      can("manage", "Customer");
      can("manage", "Order");
      can("manage", "Product");
      can("manage", "Vehicle");
      can("manage", "Invoice");
      can("manage", "Service");
      can("manage", "JobCard");
      can("manage", "VehicleAcceptance");
      can("manage", "VehiclePartRequest");
      can("manage", "VehicleOrderVoucher");
      can("manage", "VehicleOldPart");
      can("manage", "ServicePackage");
      can("manage", "Performa");
      can("manage", "Purchase");
      can("manage", "CustomerPurchase");
      can("manage", "Category");
      can("manage", "Supplier");
      can("manage", "TechnicalExaminer");
      can("manage", "Settings");
      can("read", "Dashboard");
      can("manage", "Accounts");
      can("manage", "Profile");
      can("read", "CompanyInfo");
      can("read", "Credit");
      can("manage", "Credit");
      can("read", "Report");
      can("manage", "Report");
      break;

    case "Receptionist":
      can("manage", "Customer");
      can("manage", "Vehicle");
      can("manage", "VehicleAcceptance");
      can("read", "Dashboard");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Customer Officer":
      can("read", "Dashboard");
      can("manage", "Performa");
      can("manage", "Supplier");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      can("manage", "Product");
      can("manage", "Order");
      can("manage", "Order");
      can("manage", "Category");
      can("manage", "Purchase");
      can("manage", "CustomerPurchase");
      can("manage", "Credit");
      can("manage", "Invoice");
      can("manage", "VehiclePartRequest");
      cannot("read", "Accounts");
      break;

    case "Store Manager":
      can("manage", "Product");
      can("manage", "Order");
      can("manage", "Category");
      can("manage", "Purchase");
      can("manage", "CustomerPurchase");
      can("read", "Dashboard");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Cashier":
      can("read", "Dashboard");
      can("manage", "Order");
      can("manage", "Invoice");
      can("manage", "CustomerPurchase");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Mechanic":
    case "Electrician":
    case "Paint Worker":
      can(["read", "update"], "Task");
      cannot("read", "Dashboard");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Finance":
      can("manage", "Invoice");
      can("manage", "CustomerPurchase");
      can("read", "Dashboard");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Technical Examiner":
      can(["read", "create"], "TechnicalExaminer");
      can("read", "Dashboard");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    case "Field Operator":
      can("read", "Dashboard");
      can("manage", "VehicleAcceptance");
      can("manage", "VehicleOldPart");
      can("manage", "Settings");
      can(["read", "update"], "Profile");
      cannot("read", "Accounts");
      break;

    default:
      cannot(["manage", "create", "read", "update"], "all");
      break;
  }

  return build();
}

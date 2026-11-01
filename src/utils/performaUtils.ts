// utils/performaUtils.ts

export const formatCurrency = (amount: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0.00";
  }
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const calculateSubtotal = (items: Array<{ quantity: number; unitPrice: number }>): number => {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
};

export const calculateVAT = (items: Array<{ quantity: number; unitPrice: number }>): number => {
  return calculateSubtotal(items) * 0.15;
};

export const calculateTotal = (
  items: Array<{ quantity: number; unitPrice: number }>,
  receipt: string
): number => {
  return receipt === "No Receipt" ? calculateSubtotal(items) : calculateSubtotal(items) + calculateVAT(items);
};

export const areAllItemsValid = (items: Array<{ product: string; quantity: number; unitPrice: number }>): boolean => {
  return items.every(
    (item) =>
      item.product.trim() !== "" &&
      item.quantity > 0 &&
      item.unitPrice > 0
  );
};

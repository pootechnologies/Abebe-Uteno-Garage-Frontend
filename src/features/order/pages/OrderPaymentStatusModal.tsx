import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/apiConfig.js";
import { t } from "i18next";
import { X, CreditCard, User, DollarSign, CheckCircle2 } from "lucide-react";
import ReactSelect from "react-select";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const updatePaymentStatus = async ({ id, data }) => {
  const response = await axios.patch(
    `${API_BASE_URL}${API_ENDPOINTS.ORDERS}${id}`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

const paymentStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Unpaid", value: "Unpaid" },
];

const statusColors = {
  Paid: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Pending: "text-amber-600 bg-amber-50 border-amber-200",
  Unpaid: "text-red-600 bg-red-50 border-red-200",
};

const OrderPaymentStatusModal = ({
  open,
  onClose,
  selectedRowPayment,
  paymentStatus,
  setPaymentStatus,
  paidAmount,
  setPaidAmount,
}) => {
  const queryClient = useQueryClient();
  const unPaidAmount = selectedRowPayment.unpaid_amount;
  const isDisabled = unPaidAmount == 0.0;

  const mutation = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment status updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(
        `Update failed: ${error.response?.data?.paid_amount || error.message}`
      );
    },
  });

  const handleSubmit = () => {
    const numericPaidAmount = parseFloat(String(paidAmount).replace(/,/g, ""));
    const data = {
      payment_status: paymentStatus,
      paid_amount: numericPaidAmount,
    };
    mutation.mutate({ id: selectedRowPayment.id, data });
  };

  if (!open) return null;

  const currentStatus = selectedRowPayment?.payment_status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/30">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-600">
                    {t("update_payment_status") || "Update Payment Status"}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Customer Info Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {t("customer_name") || "Customer Name"}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {selectedRowPayment.customer_name || "—"}
                </p>
              </div>
              {currentStatus && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[currentStatus] || "text-gray-600 bg-gray-50 border-gray-200"}`}>
                  {currentStatus}
                </span>
              )}
            </div>

            {/* Payment Status Select */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t("payment_status") || "Payment Status"}
              </label>
              <ReactSelect
                id="modal-payment-status"
                options={paymentStatusOptions}
                value={paymentStatusOptions.find((o) => o.value === paymentStatus) || null}
                onChange={(selected) => setPaymentStatus(selected?.value || "")}
                placeholder={t("select_payment_status") || "Select status..."}
                isClearable
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    borderColor: state.isFocused ? "var(--emerald-600, #059669)" : "var(--border)",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(5, 150, 105, 0.2)" : "none",
                    backgroundColor: "transparent",
                    minHeight: "44px",
                    "&:hover": { borderColor: "#059669" },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                    border: "1px solid var(--border)",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#059669"
                      : state.isFocused
                      ? "rgba(5,150,105,0.08)"
                      : "transparent",
                    color: state.isSelected ? "white" : "inherit",
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({ ...base, fontWeight: 500 }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                }}
              />
            </div>

            {/* Paid Amount Input */}
            <div className="space-y-2">
              <label
                htmlFor="paid-amount-input"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <DollarSign className="h-4 w-4 text-emerald-600" />
                {t("paid_amount") || "Paid Amount"}
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors ${paymentStatus === "Paid" ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
                <input
                  id="paid-amount-input"
                  type="text"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={paymentStatus === "Paid"}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
                    paymentStatus === "Paid"
                      ? "bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  }`}
                />
              </div>
              {unPaidAmount !== undefined && (
                <p className="text-xs text-muted-foreground pl-1">
                  {t("unpaid_amount") || "Unpaid amount"}:{" "}
                  <span className={`font-semibold ${unPaidAmount > 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {unPaidAmount}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-5 h-10 text-sm font-medium border-border hover:bg-muted/50"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="rounded-xl px-6 h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("updating") || "Updating..."}
                </span>
              ) : (
                t("update") || "Update"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentStatusModal;

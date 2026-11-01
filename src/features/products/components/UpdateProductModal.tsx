import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import {
  Pencil,
  Tag,
  FileText,
  Banknote,
  BarChart4,
  Warehouse,
  Hash,
  Box,
  ShoppingBag
} from "lucide-react";

const unitOptions = [
  { value: "PCS", label: "PCS" },
  { value: "Set", label: "Set" },
  { value: "Quantile", label: "Quantile" },
  { value: "Liter", label: "Liter" },
];

interface UpdateProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: any) => Promise<void>;
  register: any;
  handleSubmit: any;
  isUpdating: boolean;
  selectedProduct?: any;
}

const UpdateProductModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  register,
  handleSubmit,
  isUpdating,
  selectedProduct,
  watch,
}: UpdateProductModalProps) => {
  const { t } = useTranslation();
  const currentStock = watch ? watch("stock") : selectedProduct?.stock || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[95vh]">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">
                <Pencil className="h-6 w-6" />
              </div>
              {t("update_product")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("product_name")}
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  {...register("name")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("part_number")}
              </Label>
              <div className="relative group">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  {...register("part_number")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("receipt_no") || "Receipt Number"}
              </Label>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  {...register("receipt_no")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("stock")}
              </Label>
              {selectedProduct && (
                <p className="text-sm text-gray-600">Available stock current: {currentStock}</p>
              )}
              <div className="relative group">
                <BarChart4 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  {...register("stock", {
                    valueAsNumber: true,
                    validate: (value) => value >= 0 || "Stock must be zero or greater"
                  })}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("buying_price")} (ETB)
              </Label>
              <div className="relative group">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  step="0.01"
                  {...register("buyingPrice")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("selling_price")} (ETB)
              </Label>
              <div className="relative group">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  step="0.01"
                  {...register("sellingPrice", {
                    valueAsNumber: true,
                    required: t("selling_price_required"),
                    validate: (value) => value >= 0 || t("selling_price_cannot_be_negative")
                  })}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("unit")}
              </Label>
              <div className="relative group">
                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <select
                  {...register("unit")}
                  className="w-full appearance-none pl-10 h-11 bg-muted/20 border border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("piece")}
              </Label>
              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  {...register("piece")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("package")}
              </Label>
              <div className="relative group">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  {...register("package")}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("description")}
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Textarea
                  {...register("description")}
                  rows={3}
                  className="pl-10 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-11 transition-all"
              disabled={isUpdating}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 h-11 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex gap-2 items-center justify-center font-bold"
            >
              {isUpdating && (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {t("update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductModal;

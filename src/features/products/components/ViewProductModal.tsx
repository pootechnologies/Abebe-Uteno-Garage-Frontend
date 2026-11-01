import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  Info, 
  Hash, 
  Tag, 
  Banknote, 
  BarChart4, 
  UserCircle, 
  Box, 
  FileText,
  Warehouse,
  ShoppingBag
} from "lucide-react";
import { formatCurrency } from "@/utils/numberFormaterStats";

interface Product {
  id: number;
  name: string;
  part_number: string | null;
  category_name: string | null;
  description: string | null;
  buying_price: number;
  selling_price: number;
  stock: number;
  unit: string;
  piece: number | null;
  package: number | null;
  supplier_name: string | null;
  user: string;
  image: string | null;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ViewProductModal = ({ 
  isOpen, 
  onOpenChange, 
  product
}: ViewProductModalProps) => {
  const { t } = useTranslation();

  if (!product) return null;

  const detailItems = [
    { label: t("id"), value: `#${product.id}`, icon: Hash },
    { label: t("product_name"), value: product.name, icon: FileText, fullWidth: true },
    { label: t("part_number"), value: product.part_number || "-", icon: Tag },
    { label: t("category_name"), value: product.category_name || "-", icon: Box },
    { label: t("buying_price"), value: `${formatCurrency(product.buying_price)} ETB`, icon: Banknote },
    { label: t("selling_price"), value: `${formatCurrency(product.selling_price)} ETB`, icon: ShoppingBag },
    { label: t("stock"), value: product.stock, icon: BarChart4, highlight: product.stock <= 3 },
    { label: t("unit"), value: product.unit, icon: Warehouse },
    { label: t("piece"), value: product.piece || "-", icon: Hash },
    { label: t("package"), value: product.package || "-", icon: Box },
    { label: t("supplier"), value: product.supplier_name || "-", icon: UserCircle, fullWidth: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <div className="p-2 bg-primary text-white rounded-lg shadow-lg">
                <Info className="h-5 w-5" />
              </div>
              {t("product_details")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-all ${item.fullWidth ? 'sm:col-span-2' : ''}`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  <item.icon className="h-3 w-3 text-primary" />
                  {item.label}
                </div>
                <div className={`text-sm font-bold ${item.highlight ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                  {item.value}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-all sm:col-span-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                <UserCircle className="h-3 w-3 text-primary" />
                {t("recorded_by")}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm font-bold text-foreground">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                  {(product.user || "U").substring(0, 2).toUpperCase()}
                </div>
                {product.user}
              </div>
            </div>
          </div>
          
          {product.description && (
             <div className="p-4 bg-muted/20 rounded-xl border border-muted-foreground/5 italic text-sm text-muted-foreground leading-relaxed">
                <span className="font-bold text-xs uppercase block mb-1 not-italic text-foreground/70">{t("description")}</span>
                {product.description}
             </div>
          )}

          <div className="flex justify-end pt-4 shrink-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="rounded-xl px-10 border-muted-foreground/20 hover:bg-muted/50 h-11 transition-all"
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProductModal;

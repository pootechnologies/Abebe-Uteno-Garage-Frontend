import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  UserCircle, 
  Phone, 
  Fingerprint, 
  Hash, 
  Info,
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  contact_info: string | null;
  tin_number: string | null;
  user: string;
}

interface ViewSupplierModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

const ViewSupplierModal = ({ 
  isOpen, 
  onOpenChange, 
  supplier 
}: ViewSupplierModalProps) => {
  const { t } = useTranslation();

  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <div className="p-2 bg-primary text-white rounded-lg shadow-lg">
                <Info className="h-5 w-5" />
              </div>
              {t("supplier_details")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <UserCircle className="h-3 w-3 text-primary" />
                {t("supplier_name")}
              </div>
              <div className="text-base font-bold text-foreground">{supplier.name}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Hash className="h-3 w-3 text-primary" />
                {t("id")}
              </div>
              <div className="text-sm font-bold text-foreground">#{supplier.id}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Phone className="h-3 w-3 text-primary" />
                {t("contact_info")}
              </div>
              <div className="text-sm font-semibold text-foreground">{supplier.contact_info || "-"}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Fingerprint className="h-3 w-3 text-primary" />
                {t("tin_number")}
              </div>
              <div className="text-sm font-semibold text-foreground">{supplier.tin_number || "-"}</div>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <UserCircle className="h-3 w-3 text-primary" />
                {t("recorded_by")}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                  {(supplier.user || "U").substring(0, 2).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-foreground">{supplier.user}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="rounded-xl px-8 border-muted-foreground/20 hover:bg-muted/50"
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSupplierModal;

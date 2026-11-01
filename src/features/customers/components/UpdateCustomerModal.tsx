import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  UserCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Fingerprint,
  Pencil
} from "lucide-react";
import { t } from "i18next";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  tin_number: string | null;
  organization: string | null;
}

interface UpdateCustomerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  formData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    tin_number: string;
    organization: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

const UpdateCustomerModal = ({
  isOpen,
  onOpenChange,
  customer,
  formData,
  onInputChange,
  onSubmit,
  isUpdating,
}: UpdateCustomerModalProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[70vh]">
      <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10 shrink-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Pencil className="h-5 w-5" />
            </div>
            {t("update_customer")}
          </DialogTitle>
        </DialogHeader>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("customer_name")}
            </Label>
            <div className="relative group">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
              <Input
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("organization")}
            </Label>
            <div className="relative group">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
              <Input
                name="organization"
                value={formData.organization}
                onChange={onInputChange}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("Phone_number")}
            </Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
              <PhoneInput
                value={formData.phone}
                onChange={(value) =>
                  onInputChange({
                    target: { name: "phone", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("email")}
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("address")}
            </Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
              <Input
                name="address"
                value={formData.address}
                onChange={onInputChange}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("tin_number")}
            </Label>
            <div className="relative group">
              <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
              <Input
                name="tin_number"
                value={formData.tin_number}
                onChange={onInputChange}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-6"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("updating...")}
              </span>
            ) : t("update")}
          </Button>
        </div>
      </form>
      </div>
    </DialogContent>
  </Dialog>
);

export default UpdateCustomerModal;

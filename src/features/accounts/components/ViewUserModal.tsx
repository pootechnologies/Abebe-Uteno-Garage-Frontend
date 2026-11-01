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
  Mail, 
  Shield, 
  Hash, 
  Info,
} from "lucide-react";

const ViewUserModal = ({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <div className="p-2 bg-primary text-white rounded-lg shadow-lg">
                <Info className="h-5 w-5" />
              </div>
              {t("user_details")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <UserCircle className="h-3 w-3 text-primary" />
                {t("name")}
              </div>
              <div className="text-base font-bold text-foreground">{user.name}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Hash className="h-3 w-3 text-primary" />
                {t("id")}
              </div>
              <div className="text-sm font-bold text-foreground">#{user.id}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Shield className="h-3 w-3 text-primary" />
                {t("role")}
              </div>
              <div className="text-sm font-semibold text-foreground">{user.role || t("n_a")}</div>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Mail className="h-3 w-3 text-primary" />
                {t("email")}
              </div>
              <div className="text-sm font-semibold text-foreground">{user.email}</div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
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

export default ViewUserModal;

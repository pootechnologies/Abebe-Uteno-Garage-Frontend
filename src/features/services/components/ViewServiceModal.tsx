import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { 
  Briefcase, 
  Hash, 
  FileText, 
  Banknote, 
  Clock, 
} from "lucide-react";
import { formatCurrency } from "@/utils/numberFormaterStats";

interface ViewServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: any;
}

const InfoRow = ({ icon: Icon, label, value, isDescription }: { icon: any, label: string, value: string | number | null, isDescription?: boolean }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-muted/50 transition-all hover:bg-muted/40 hover:border-primary/20 group">
    <div className="mt-0.5 p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shadow-sm">
      <Icon className="h-4 w-4" />
    </div>
    <div className={`space-y-1.5 ${isDescription ? "w-full" : "overflow-hidden"}`}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
      <p className={`text-sm font-bold text-foreground ${isDescription ? "text-xs text-muted-foreground italic leading-relaxed break-words whitespace-normal" : "truncate"}`}>{value || "—"}</p>
    </div>
  </div>
);

export const ViewServiceModal = ({ isOpen, onOpenChange, service }: ViewServiceModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              {t("service_details")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          {service ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <InfoRow icon={Briefcase} label={t("name")} value={service.name} />
              </div>
              <InfoRow icon={Hash} label={t("id")} value={`#${service.id}`} />
              <InfoRow icon={Banknote} label={t("cost")} value={service.cost ? formatCurrency(service.cost) : t("not_available")} />
              <div className="sm:col-span-2">
                <InfoRow icon={FileText} label={t("description")} value={service.description || t("not_available")} isDescription={true} />
              </div>
              <div className="sm:col-span-2">
                <InfoRow icon={Clock} label={t("duration")} value={service.duration || t("not_available")} />
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="p-4 bg-muted rounded-full">
                <Briefcase className="h-8 w-8 opacity-20" />
              </div>
              <p className="font-medium animate-pulse">{t("loading_details") || "Loading details"}...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

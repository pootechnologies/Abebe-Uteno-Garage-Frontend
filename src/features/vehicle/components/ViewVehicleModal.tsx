import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import { 
  Car, 
  Hash, 
  UserCircle, 
  CreditCard, 
  Calendar, 
  Palette, 
  User, 
  Fingerprint,
  Settings,
  Info,
  Maximize2
} from "lucide-react";

interface Vehicle {
    id: number;
    license_plate: string;
    motor_kutir: string;
    shanci_kutir: string;
    model: string;
    year: number;
    user: string;
    customer: string;
    customer_name: string;
    image: string;
}

interface ViewVehicleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle: Vehicle | null;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | null }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-muted/50 transition-all hover:bg-muted/40 hover:border-primary/20 group">
    <div className="mt-0.5 p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shadow-sm">
      <Icon className="h-4 w-4" />
    </div>
    <div className="space-y-1.5 overflow-hidden">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
      <p className="text-sm font-bold text-foreground truncate">{value || "—"}</p>
    </div>
  </div>
);

const ViewVehicleModal = ({ isOpen, onOpenChange, vehicle }: ViewVehicleModalProps) => {
    const { t } = useTranslation();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] lg:max-w-3xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl max-h-[85vh] flex flex-col">
                <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg">
                                <Car className="h-5 w-5" />
                            </div>
                            {t("vehicle_details")}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {vehicle ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <InfoRow icon={UserCircle} label={t("customer")} value={vehicle.customer_name} />
                            </div>
                            <InfoRow icon={Fingerprint} label={t("id")} value={`#${vehicle.id}`} />
                            <InfoRow icon={CreditCard} label={t("license_plate")} value={vehicle.license_plate} />
                            <InfoRow icon={Settings} label={t("motor_kutir")} value={vehicle.motor_kutir} />
                            <InfoRow icon={Hash} label={t("shanci_kutir")} value={vehicle.shanci_kutir} />
                            <InfoRow icon={Car} label={t("model")} value={vehicle.model} />
                            <InfoRow icon={Calendar} label={t("year")} value={vehicle.year} />
                            <InfoRow icon={User} label={t("created_by")} value={vehicle.user} />
                            
                            {vehicle.image && (
                                <div className="sm:col-span-2 space-y-3 mt-2">
                                    <div className="flex items-center gap-2 px-1">
                                        {/* <div className="h-1.5 w-1.5 rounded-full bg-primary" /> */}
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("vehicle_image")}</h4>
                                    </div>
                                    <div 
                                        className="relative group cursor-pointer overflow-hidden rounded-2xl border border-muted-foreground/20 hover:border-primary/30 transition-all aspect-video bg-muted/10 shadow-sm"
                                        onClick={() => setIsImageModalOpen(true)}
                                    >
                                        <img
                                            src={`${IMAGE_BASE_URL}${vehicle.image}`}
                                            alt={t("vehicle_image")}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white">
                                                <Maximize2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="p-4 bg-muted rounded-full">
                                <Car className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="font-medium animate-pulse">{t("loading_details")}...</p>
                        </div>
                    )}
                </div>
            </DialogContent>

            {/* Image Preview Modal */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-4xl bg-transparent border-none shadow-none p-2 outline-none">
                    <img
                        src={`${IMAGE_BASE_URL}${vehicle?.image}`}
                        alt={t("vehicle_image")}
                        className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
                    />
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default ViewVehicleModal;

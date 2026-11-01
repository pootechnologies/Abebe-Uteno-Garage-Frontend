import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { IMAGE_BASE_URL } from "@/utils/apiConfig.ts";
import { z } from "zod";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { getCustomersForVehicle } from "@/features/customers/api/customer";
import ImageModal from "@/features/products/components/ImageModal";
import { 
  Car, 
  Hash, 
  UserCircle, 
  CreditCard, 
  Calendar, 
  Palette, 
  Settings, 
  Pencil,
  Upload,
  Image as ImageIcon,
  ZoomIn
} from "lucide-react";

interface Vehicle {
  id: number;
  customer?: number;
  customer_name?: string;
  license_plate: string;
  motor_kutir: string;
  shanci_kutir: string;
  model: string;
  year: number | null;
  image?: string | null;
}

interface UpdateVehicleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  formData: {
    customer_name?: string;
    customer?: number | null;
    license_plate: string;
    motor_kutir: string;
    shanci_kutir: string;
    model: string;
    year: number;
    image?: File | string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      customer_name?: string;
      customer?: number | null;
      license_plate: string;
      motor_kutir: string;
      shanci_kutir: string;
      model: string;
      year: number;
      image?: File | string;
    }>
  >;
}

const getVehicleSchema = (t: (key: string) => string) =>
  z.object({
    customer_name: z.string().min(1, { message: t("customer_name_required") }),
    license_plate: z
      .string()
      .min(1, { message: t("license_plate_required") })
      .max(20, { message: t("license_plate_max_length") }),
    motor_kutir: z.string().optional(), // Make optional
    shanci_kutir: z.string().optional(), // Make optional
    model: z.string().max(50, { message: t("model_max_length") }).optional(),
    year: z.coerce.number().max(new Date().getFullYear()).optional(),
    image: z.union([z.instanceof(File), z.string()]).optional().nullable(),
  });

const UpdateVehicleModal = ({
  isOpen,
  onOpenChange,
  vehicle,
  formData,
  onInputChange,
  onSubmit,
  isUpdating,
  setFormData,
}: UpdateVehicleModalProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const schema = getVehicleSchema(t);

  const { data: customers, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomersForVehicle,
  });

  const customerOptions = Array.isArray(customers)
    ? customers.map((c: any) => ({
      value: c.id,
      label: c.organization || c.name,
    }))
    : [];

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = schema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(e);
  };

  const defaultCustomerOption =
    vehicle?.customer && customerOptions.length
      ? customerOptions.find((opt) => opt.value === vehicle.customer) || null
      : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-3xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col max-h-[85vh]">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <Pencil className="h-5 w-5" />
              </div>
              {t("update_vehicle")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("customer_name")}
              </Label>
              <div className="relative group">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
                <Select
                  options={customerOptions}
                  isLoading={isCustomersLoading}
                  isDisabled
                  value={
                    customerOptions.find(
                      (opt) => opt.value === formData.customer
                    ) || defaultCustomerOption
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer_name: selected?.label || "",
                      customer: selected?.value || null,
                    }))
                  }
                  placeholder={t("select_customer")}
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "2.25rem",
                      borderRadius: "0.75rem",
                      border: "2px solid var(--muted)",
                      boxShadow: "none",
                      backgroundColor: "rgba(var(--muted), 0.2)",
                      "&:hover": { borderColor: "var(--primary)" }
                    })
                  }}
                />
              </div>
              {errors.customer_name && <p className="text-[10px] text-destructive font-bold uppercase px-1">{errors.customer_name}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("license_plate")}</Label>
              <div className="relative group">
                 <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={onInputChange}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("motor_kutir")}</Label>
              <div className="relative group">
                 <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                  name="motor_kutir"
                  value={formData.motor_kutir}
                  onChange={onInputChange}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("shanci_kutir")}</Label>
              <div className="relative group">
                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                  name="shanci_kutir"
                  value={formData.shanci_kutir}
                  onChange={onInputChange}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("model")}</Label>
              <div className="relative group">
                 <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                  name="model"
                  value={formData.model}
                  onChange={onInputChange}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("year")}</Label>
              <div className="relative group">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                 <Input
                  type="number" onWheel={(event) => event.currentTarget.blur()}
                  name="year"
                  value={formData.year}
                  onChange={onInputChange}
                  className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-3 pt-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("vehicle_image")}</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                {(previewImage || vehicle?.image) && (
                  <div className="relative group/img w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-muted-foreground/20 shadow-md">
                    <img
                      src={previewImage || `${IMAGE_BASE_URL}${vehicle?.image}`}
                      alt={t("vehicle_image")}
                      className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                      >
                        <ZoomIn className="h-6 w-6" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{t("view_image") || "View"}</span>
                      </button>
                    </div>
                  </div>
                )}
                <div 
                  className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group/upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground group-hover/upload:text-emerald-500 transition-colors mb-2" />
                  <p className="text-xs font-bold text-muted-foreground group-hover/upload:text-emerald-600 uppercase tracking-widest">{t("upload_image")}</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-muted">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6">{t("cancel")}</Button>
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
      </DialogContent>
    </Dialog>

    <ImageModal
      isOpen={imageModalOpen}
      onOpenChange={setImageModalOpen}
      imageUrl={previewImage || (vehicle?.image ? `${IMAGE_BASE_URL}${vehicle.image}` : null)}
    />
  </>);
};

export default UpdateVehicleModal;

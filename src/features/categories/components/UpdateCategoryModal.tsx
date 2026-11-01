import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { 
  Tag, 
  Pencil,
} from "lucide-react";
import { useState } from "react";

interface UpdateCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  register: any;
  errors: any;
}

export const UpdateCategoryModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  register,
  errors,
}: UpdateCategoryModalProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl flex flex-col">
        <div className="bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-5 border-b border-emerald-500/10 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-emerald-600">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
                <Pencil className="h-5 w-5" />
              </div>
              {t("update_category")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {t("category_name")}
            </Label>
            <div className="relative group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors z-10" />
              <Input
                {...register("name", {
                  required: t("category_name_required") || "Category name is required",
                })}
                placeholder={t("enter_category_name") || "Enter category name"}
                className="pl-10 h-11 bg-muted/20 border-muted-foreground/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-[10px] text-destructive font-bold uppercase px-1 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-muted">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="rounded-xl px-6"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : null}
              {t("update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

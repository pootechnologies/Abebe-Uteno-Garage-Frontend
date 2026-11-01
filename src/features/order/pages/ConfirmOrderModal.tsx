import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ConfirmOrderModal = ({
  isOpen,
  onConfirm,
  onCancel,
  isSubmitting: parentIsSubmitting,
}: ConfirmOrderModalProps) => {
  const { t } = useTranslation();

  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  const isSubmitting =
    parentIsSubmitting !== undefined
      ? parentIsSubmitting
      : localIsSubmitting;

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    if (parentIsSubmitting === undefined) {
      setLocalIsSubmitting(true);
    }

    try {
      await onConfirm();
    } finally {
      if (parentIsSubmitting === undefined) {
        setLocalIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    onCancel();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-emerald-500/5 px-6 py-6 flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-full shadow-inner animate-pulse">
            <AlertTriangle className="h-10 w-10" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-600">
              {t("are_you_sure")}
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground font-medium px-4 leading-relaxed">
            {t("sure_order")}
          </p>
        </div>

        <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
            disabled={isSubmitting}
          >
            {t("no")}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            {t("yes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmOrderModal;
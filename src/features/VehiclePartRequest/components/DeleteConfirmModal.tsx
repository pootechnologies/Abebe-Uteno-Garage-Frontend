import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);

    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        {/* Warning Section */}
        <div className="bg-destructive/5 px-6 py-6 flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-full shadow-inner animate-pulse">
            <AlertTriangle className="h-10 w-10" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive">
              {t("are_you_sure")}
            </DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground font-medium px-4 leading-relaxed">
            {t("sure_part_request_delete")}
          </p>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="p-6 bg-muted/30 flex sm:justify-center gap-3 border-t border-muted">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1 rounded-xl h-11 font-semibold hover:bg-muted/50 transition-all border border-muted-foreground/10"
          >
            {t("no") || "No"}
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-destructive/20 transition-all active:scale-95 flex gap-2 items-center justify-center disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            {isDeleting
              ? t("deleting") || "Deleting..."
              : t("yes") || "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;

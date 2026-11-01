import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  Tag, 
  UserCircle, 
  Hash, 
  Info,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  user: string;
}

interface ViewCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export const ViewCategoryModal = ({ 
  isOpen, 
  onOpenChange, 
  category 
}: ViewCategoryModalProps) => {
  const { t } = useTranslation();

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-primary">
              <div className="p-2 bg-primary text-white rounded-lg shadow-lg">
                <Info className="h-5 w-5" />
              </div>
              {t("category_details")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Hash className="h-3 w-3 text-primary" />
                {t("id")}
              </div>
              <div className="text-sm font-bold text-foreground">#{category.id}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Tag className="h-3 w-3 text-primary" />
                {t("category_name")}
              </div>
              <div className="text-base font-bold text-foreground">{category.name}</div>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-xl border border-muted-foreground/10 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <UserCircle className="h-3 w-3 text-primary" />
                {t("created_by")}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5">
                  {(category.user || "U").substring(0, 2).toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-foreground">{category.user}</div>
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
              {t("close") || "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

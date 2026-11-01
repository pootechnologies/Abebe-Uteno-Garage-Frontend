import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

const ImageModal = ({ isOpen, onOpenChange, imageUrl }: ImageModalProps) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
    });
  }, []);

  const zoomIn = () =>
    setScale((prev) => Math.min(MAX_ZOOM, parseFloat((prev + ZOOM_STEP).toFixed(2))));

  const zoomOut = () =>
    setScale((prev) => Math.max(MIN_ZOOM, parseFloat((prev - ZOOM_STEP).toFixed(2))));

  const reset = () => setScale(1);

  const handleOpenChange = (open: boolean) => {
    if (!open) setScale(1);
    onOpenChange(open);
  };

  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 overflow-hidden bg-black/90 border-none shadow-none rounded-2xl">
        {/* Toolbar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_ZOOM}
            className="p-1.5 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-white text-xs font-mono w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= MAX_ZOOM}
            className="p-1.5 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          <button
            onClick={reset}
            className="p-1.5 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOpenChange(false)}
          className="absolute top-3 right-3 z-50 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white border border-white/10 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Image container */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="flex items-center justify-center w-full overflow-auto"
          style={{ height: "90vh", cursor: scale > 1 ? "grab" : "default" }}
        >
          <img
            src={imageUrl}
            alt="Enlarged view"
            draggable={false}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease",
              maxHeight: "85vh",
              maxWidth: "90vw",
              objectFit: "contain",
              borderRadius: "0.75rem",
              userSelect: "none",
            }}
          />
        </div>

        {/* Hint */}
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-medium select-none pointer-events-none whitespace-nowrap">
          Scroll to zoom
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;

import { Button } from "@/components/ui/button";
import React from "react";

const ImageModal = ({ imageUrl, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={onClose}
  >
    <img
      src={imageUrl}
      alt="Full Size"
      style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
    />
    <Button className="absolute top-0 right-0" onClick={onClose}>Close</Button>
  </div>
);

export default ImageModal;

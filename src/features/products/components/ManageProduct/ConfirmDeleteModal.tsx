import { Button } from "@/components/ui/button";
import { t } from "i18next";

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "400px",
      }}
    >
      <h2 className="mb-4 font-bold text-2xl border-b p-1">
        {t("are_you_sure")}
      </h2>
      <p>{t("sure_discription")}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
        >
          {t("delete")}
        </Button>
        <Button
          onClick={onCancel}
          className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmDeleteModal;

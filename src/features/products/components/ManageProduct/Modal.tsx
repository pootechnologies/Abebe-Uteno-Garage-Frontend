import {Button} from "@/components/ui/button";
import {t} from "i18next";

const Modal = ({product, onClose}) => {
    if (!product) return null;

    return (
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
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "400px",
                    position: "relative",
                }}
            >
                <h2 className="mb-4 font-bold text-xl border-b p-1">
                    {t("product_details")}
                </h2>
                {/* <div className="mb-4">
          <img
            src={`${IMAGE_BASE_URL}${product.image}`}
            alt={product.category_name}
            className="w-full h-48 object-cover rounded-md"
          />
        </div> */}
                <p className="m-2">
                    {t("product_name")}: <span className="font-bold">{product.name}</span>
                </p>
                <p className="m-2">
                    {t("part_number")}: <span className="font-bold">{product.part_number}</span>
                </p>
                <p className="m-2">
                    {t("description")}:{" "}
                    <span className="font-bold"> {product.description}</span>
                </p>
                <p className="m-2">
                    {t("buying_price")}:{" "}
                    <span className="font-bold"> {product.buying_price}</span>
                </p>
                <p className="m-2">
                    {t("selling_price")}:{" "}
                    <span className="font-bold"> {product.selling_price}</span>
                </p>
                <p className="m-2">
                    {t("stock")}: <span className="font-bold"> {product.stock}</span>
                </p>
                <p className="m-2">
                    {t("unit")}: <span className="font-bold"> {product.unit ? product.unit : "N/A"}</span>
                </p>
                <div className="flex justify-end">
                    <Button
                        className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;

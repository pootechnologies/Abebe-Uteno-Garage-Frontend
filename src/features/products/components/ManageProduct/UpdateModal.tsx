import { Button } from "@/components/ui/button";
import { t } from "i18next";

const UpdateModal = ({
  onClose,
  onSubmit,
  selectedProduct,
  register,
  handleSubmit,
  handleFileChange,
  fileName,
}) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/50 bg-opacity-50 flex justify-center items-center z-[1000]"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="bg-white p-5 rounded-lg w-4/5 lg:w-1/2 max-h-[80vh] overflow-hidden relative flex flex-col">
        <div className="sticky top-0 bg-white z-10 pb-4">
          <h2 className="font-bold text-xl border-b p-1">
            {t("update_product")}
          </h2>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="overflow-y-auto flex-1">
            {/* <div className="mb-10 w-52 h-40 border flex justify-between">
              <img
                src={`${IMAGE_BASE_URL}${selectedProduct.image}`}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-md"
              />
            </div> */}
            <div className="mb-4">
              <label className="block mb-2">{t("product_name")}</label>
              <input
                type="text"
                defaultValue={selectedProduct.name}
                {...register("name")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("part_number")}</label>
              <input
                type="text"
                defaultValue={selectedProduct.part_number}
                {...register("part_number")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("description")}</label>
              <textarea
                defaultValue={selectedProduct.description}
                {...register("description")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("buying_price")}</label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                step="0.01"
                defaultValue={selectedProduct.buying_price}
                {...register("buyingPrice")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("selling_price")}</label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                step="0.01"
                defaultValue={selectedProduct.selling_price}
                {...register("sellingPrice")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("stock")}</label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                defaultValue={selectedProduct.stock}
                {...register("stock")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("unit")}</label>
              <input
                type="text"
                defaultValue={selectedProduct.unit}
                {...register("unit")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("piece")}</label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                defaultValue={selectedProduct.piece}
                {...register("piece")}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t("package")}</label>
              <input
                type="number" onWheel={(event) => event.currentTarget.blur()}
                defaultValue={selectedProduct.package}
                {...register("package")}
                className="w-full border rounded p-2"
              />
            </div>
            {/* <div className="mb-4">
              <label className="block mb-2">{t("product_image")}</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border rounded p-2"
              />
              {fileName && <p className="mt-2">Selected File: {fileName}</p>}
            </div> */}
          </div>
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <div className="space-x-5 flex justify-end">
              <Button
                type="submit"
                className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
              >
                {t("update")}
              </Button>
              <Button
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                onClick={onClose}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateModal;

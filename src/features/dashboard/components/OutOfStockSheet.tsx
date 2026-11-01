import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

export default function OutOfStockSheet({
    open,
    onOpenChange,
    products,
}: any) {
    
    const lowStockProducts = products || [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full border-l bg-white p-0 sm:max-w-[480px]"
            >
                {/* Header */}
                <SheetHeader className="shrink-0 border-b bg-gradient-to-b from-red-50/80 to-white px-6 py-6">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                                <path d="M10.3 3.8 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <SheetTitle className="text-xl font-semibold tracking-tight text-gray-900">
                                Low Stock Products
                            </SheetTitle>

                            <SheetDescription className="mt-1 text-sm text-gray-500">
                                Products with fewer than 4 items in stock.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Main Content */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {lowStockProducts.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-7 w-7 text-green-600"
                                >
                                    <path d="m5 12 4 4L19 6" />
                                </svg>
                            </div>

                            <h3 className="text-sm font-semibold text-gray-900">
                                Everything looks good
                            </h3>

                            <p className="mt-1 max-w-xs text-sm text-gray-500">
                                There are currently no products with low stock.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 px-6 py-5">
                            {/* Fixed Stock Alert */}
                            <div className="shrink-0 rounded-xl border border-red-100 bg-red-50 px-4 py-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-900">
                                            Stock Alert
                                        </p>

                                        <p className="mt-0.5 text-xs text-red-600">
                                            Restocking may be required soon.
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                                        {lowStockProducts.length}
                                    </span>
                                </div>
                            </div>

                            {/* Fixed Height Product Box */}
                            <div className="h-[500px] min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                {/* Fixed Table Header */}
                                <div className="grid grid-cols-[1fr_auto] border-b bg-gray-50 px-4 py-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Product
                                    </span>

                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Stock
                                    </span>
                                </div>

                                {/* Only Products Scroll */}
                                <div className="h-[calc(100%-49px)] overflow-y-auto">
                                    <div className="divide-y divide-gray-100">
                                        {lowStockProducts.map(
                                            (product: any) => {
                                                const stock = Number(
                                                    product.stock
                                                );

                                                return (
                                                    <div
                                                        key={product.id}
                                                        className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50"
                                                    >
                                                        {/* Product */}
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {product.name}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-gray-400">
                                                                Product ID:{" "}
                                                                {product.id}
                                                            </p>
                                                        </div>

                                                        {/* Stock */}
                                                        <span
                                                            className={`inline-flex min-w-[60px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                stock <= 1
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-orange-100 text-orange-700"
                                                            }`}
                                                        >
                                                            {stock} left
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
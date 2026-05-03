import { Order, OrderStatus } from "@prisma/client";

interface HardwarePendingScreenProps {
    latestOrder: any; // Order with items and products
}

/**
 * Placeholder component for users who have ordered hardware but haven't registered any devices yet.
 */
export function HardwarePendingScreen({ latestOrder }: HardwarePendingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Hardware is on the Way!</h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                    We've received your order. Once you receive and activate your devices, your dashboard will automatically come to life.
                </p>
            </div>

            {latestOrder && (
                <div className="bg-white border rounded-xl p-6 w-full max-w-md shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <span className="font-semibold text-gray-900">Order #{latestOrder.id.slice(-8).toUpperCase()}</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {latestOrder.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <div className="space-y-3 text-left">
                        {latestOrder.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                        Placed on {new Date(latestOrder.createdAt).toLocaleDateString()}
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center space-y-2">
                <p className="text-sm text-gray-500">Need help? Contact our support team.</p>
                <a href="mailto:support@photoup.pt" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
                    support@photoup.pt
                </a>
            </div>
        </div>
    );
}

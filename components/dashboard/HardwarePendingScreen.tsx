import { Order, OrderStatus } from "@prisma/client";
import { OrderIlustration } from "../resources/ilustrations";

interface HardwarePendingScreenProps {
    latestOrder: any; // Order with items and products
}

/**
 * Placeholder component for users who have ordered hardware but haven't registered any devices yet.
 */
export function HardwarePendingScreen({ latestOrder }: HardwarePendingScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <PendingHardwareHeader />
            <div className="flex items-center space-x-3 justify-center">
                <OrderWidgetCard latestOrder={latestOrder} />
                <TeamWdiget />
            </div>
        </div>
    );
}

const PendingHardwareHeader = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
            <OrderIlustration width={300} />
            <h1 className="text-3xl font-bold">O seu espaço está quase pronto</h1>
            <h5 className="text-muted-foreground text-lg max-w-xl">O seu hardware PhotoUp já está em processamento. Enquanto aguarda a entrega, conclua estes passos para garantir que os seus dados começam a fluir no minuto em que ligar os sensores. </h5>
        </div>
    );
}

const OrderWidgetCard = ({ latestOrder }: HardwarePendingScreenProps) => {

    return latestOrder && (
        <div className="bg-white border rounded-xl p-6 w-full max-w-md ">
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
    )
}


const TeamWdiget = () => {
    return "TEAM"
}
import { CheckoutSidebar } from "@/components/checkout/CheckoutSidebar";

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            <div className="flex-1">
                {children}
            </div>
            <div className="w-full lg:w-96 border-l border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 p-6 lg:ml-auto">
                <CheckoutSidebar />
            </div>
        </div>
    );
}

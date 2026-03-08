import MarketingFooter from "@/components/layout/MarketingFooter";
import { MarketingNavBar } from "@/components/layout/MarketingNavBar";
import { CartProvider } from "@/contexts/CartContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <MarketingNavBar />
        <main className="flex-1 container mx-auto px-4 w-full">
          {children}
        </main>
        <MarketingFooter />
      </div>
    </CartProvider>
  );
}

import { MarketingNavBar } from "@/components/layout/MarketingNavBar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

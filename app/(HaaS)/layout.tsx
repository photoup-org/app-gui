import DashboardShell from "@/components/haas/DashboardShell";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}

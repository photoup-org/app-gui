import DashboardShell from "@/components/dashboard/DashboardShell";

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

import './globals.css';
import type { Metadata } from "next";
import { Anek_Latin } from "next/font/google";
import { getAppSession } from "@/lib/auth/session";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const brandFont = Anek_Latin({
    variable: "--font-brand",
    subsets: ["latin"],
});


export const metadata: Metadata = {
    title: "IoT Monitor APP",
    description: "IoT Monitor APP created by PhotoUP",
};


export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAppSession();

    return (
        <html lang="pt" suppressHydrationWarning>
            <body className={`${brandFont.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <UserProvider user={session?.user}>
                        {children}
                    </UserProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
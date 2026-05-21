import './globals.css';
import type { Metadata } from "next";
import { Anek_Latin } from "next/font/google";
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


import { GlobalDeleteDialog } from "@/components/global/GlobalDeleteDialog";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html lang="pt" suppressHydrationWarning>
            <body className={`${brandFont.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
                <GlobalDeleteDialog />
            </body>
        </html>
    );
}
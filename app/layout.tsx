import './globals.css';
import type { Metadata } from "next";
import { Anek_Latin } from "next/font/google";
import { getAppSession } from "@/lib/session";
import { UserProvider } from "@/contexts/UserContext";

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
        <html lang="pt">
            <body className={`${brandFont.variable} antialiased`}>
                <UserProvider user={session?.user}>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
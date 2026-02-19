import './globals.css';
import type { Metadata } from "next";
import { Anek_Latin, Poppins } from "next/font/google";
import { auth0 } from "@/lib/auth0";
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
    const session = await auth0.getSession();

    if (session?.user) {
        session.user.roles = session.user[`${process.env.AUTH0_NAMESPACE}/roles`] as string[];
    }

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
import './globals.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { auth0 } from "@/lib/auth0";
import { UserProvider } from "@/contexts/UserContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "IoT Monitor APP",
    description: "IoT Monitor APP created by PhotoUP",
};
const nunitoSans = Nunito_Sans({ variable: '--font-sans' });


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
        <html className={nunitoSans.variable} lang="pt">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <UserProvider user={session?.user}>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
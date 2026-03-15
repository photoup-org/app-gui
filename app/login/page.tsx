import LoginForm from "@/components/auth/LoginForm";
import { LegalComponent } from "@/components/layout/MarketingFooter";
import { BrandLogo } from "@/components/resources/logos";
import ImageWithSkeleton from "@/components/ui/image-with-skeleton";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex justify-center lg:justify-between ">

            <div className="min-w-80 w-full max-w-xl min-h-screen flex flex-col items-center justify-center shrink-0">
                <LoginHeader />
                <main className="w-full max-w-sm p-5 flex-1 flex items-center justify-center flex-col gap-3">
                    <h3 className="text-3xl font-bold mb-5 w-full">Login</h3>
                    <LoginForm />
                    <p className="text-xs">Ainda não tem uma conta? <Link href="/pricing" className="text-primary font-bold">Veja os nossos planos</Link></p>
                </main>
                <LoginFooter />
            </div>
            <div className="relative hidden w-full h-screen lg:block">
                <ImageWithSkeleton
                    src="https://images.pexels.com/photos/6923525/pexels-photo-6923525.jpeg"
                    alt="Login"
                    fill
                    className="object-cover "
                />
            </div>
        </div>
    );
}

const LoginHeader = () => {
    return (
        <header className="w-full flex justify-center p-5">
            <BrandLogo />
        </header>
    );
}

const LoginFooter = () => {
    return (
        <footer className="w-full p-5">
            <LegalComponent className="text-center flex  md:flex-col-reverse gap-5 text-xs" />
        </footer>
    );
}
import { processSuccessPageData } from "@/actions/success";
import SuccessSummary from "@/components/checkout/SuccessSummary";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default async function SuccessPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;

    const result = await processSuccessPageData(resolvedSearchParams);

    if (!result.success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-background">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Ops! Algo correu mal.</h1>
                <p className="text-muted-foreground mb-6">{result.error}</p>
                <Button asChild>
                    <Link href="/">Voltar à Página Inicial</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <SuccessSummary
                orderId={result.orderId as string}
                documentUrl={result.documentUrl as string}
            />
        </div>
    );
}

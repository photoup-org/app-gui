import { getSuccessServerData } from "@/actions/success";
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
    const payment_intent = Array.isArray(resolvedSearchParams.payment_intent) ? resolvedSearchParams.payment_intent[0] : resolvedSearchParams.payment_intent;
    const setup_intent = Array.isArray(resolvedSearchParams.setup_intent) ? resolvedSearchParams.setup_intent[0] : resolvedSearchParams.setup_intent;
    const redirect_status = Array.isArray(resolvedSearchParams.redirect_status) ? resolvedSearchParams.redirect_status[0] : resolvedSearchParams.redirect_status;

    const intentId = payment_intent || setup_intent;

    if (!intentId || redirect_status === "failed") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-background">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Ops! Algo correu mal.</h1>
                <p className="text-muted-foreground mb-6">O pagamento não foi concluído com sucesso ou faltam parâmetros de encomenda.</p>
                <Button asChild>
                    <Link href="/">Voltar à Página Inicial</Link>
                </Button>
            </div>
        );
    }

    const result = await getSuccessServerData(intentId);

    if (!result.success || !result.orderId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-background">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Ops! Algo correu mal.</h1>
                <p className="text-muted-foreground mb-6">{result.error || "Encomenda não encontrada"}</p>
                <Button asChild>
                    <Link href="/">Voltar à Página Inicial</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <SuccessSummary 
                intentId={intentId}
                orderId={result.orderId}
                documentUrl={result.documentUrl || null}
            />
        </div>
    );
}

import { CheckoutClient } from "@/components/marketing/checkout/CheckoutClient";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * /checkout/summary — Async Server Component (Next.js 15 App Router).
 *
 * Reads plan_id, totalSensors, and hardware from the URL and passes them
 * to CheckoutClient which owns all form state, tab progression, and the
 * sticky CheckoutSummaryPanel.
 *
 * This page is intentionally thin — no data fetching here; the cart state
 * is managed client-side via CartContext.
 */
export default async function CheckoutSummaryPage({ searchParams }: Props) {
    const params = await searchParams;
    const planId = (params.plan_id as string) ?? null;
    const totalSensors = parseInt((params.totalSensors as string) ?? "0", 10);
    const hardwareParam = (params.hardware as string) ?? null;

    return (
        <CheckoutClient
            planId={planId}
            totalSensors={totalSensors}
            hardwareParam={hardwareParam}
        />
    );
}
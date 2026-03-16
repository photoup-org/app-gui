import { CheckoutClient } from "@/components/marketing/checkout/CheckoutClient";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

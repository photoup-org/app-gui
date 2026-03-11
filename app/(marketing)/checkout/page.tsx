import { CheckoutClient } from "@/components/marketing/checkout/CheckoutClient";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CheckoutPage({ searchParams }: Props) {
    const params = await searchParams;
    const planId = (params.plan_id as string) || null;
    const totalSensorsStr = params.totalSensors as string;
    const totalSensors = parseInt(totalSensorsStr || '0', 10);
    const hardwareParam = (params.hardware as string) || null;

    return <CheckoutClient planId={planId} totalSensors={totalSensors} hardwareParam={hardwareParam} />;
}

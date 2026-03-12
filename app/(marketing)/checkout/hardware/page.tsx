import HardwareSelectionClient from './HardwareSelectionClient';
import { getPlanAndSensors } from '@/actions/checkout';
import { redirect } from 'next/navigation';

export default async function HardwareSelectionPage({
    searchParams
}: {
    searchParams: Promise<{ product_id?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const productId = resolvedSearchParams.product_id;

    if (!productId) {
        redirect('/pricing');
    }

    const { plan, sensors } = await getPlanAndSensors(productId);

    if (!plan) {
        redirect('/pricing');
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            <HardwareSelectionClient plan={plan} sensors={sensors} />
        </div>
    );
}

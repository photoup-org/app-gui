import { SubscriptionPlan } from '@/components/SubscriptionPlan';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Choose the plan that's right for you
                    </p>
                </div>
                <div className="mt-12">
                    <SubscriptionPlan />
                </div>
            </div>
        </div>
    );
}

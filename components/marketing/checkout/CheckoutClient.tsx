'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { createSubscriptionIntent } from '@/actions/stripe';
import { validateVatAction } from '@/actions/vies';
import { CheckoutFormData, CheckoutFormValues } from '@/types/checkout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '@/components/marketing/checkout/StripePaymentForm';
import { OrganizacaoTab } from '@/components/marketing/checkout/tabs/OrganizacaoTab';
import { AdministradorTab } from '@/components/marketing/checkout/tabs/AdministradorTab';
import { CheckoutSummaryPanel } from '@/components/marketing/checkout/CheckoutSummaryPanel';
import { cn } from '@/lib/utils';

// Only the publishable key is referenced here — no secret ever touches the client.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type Tab = 'organizacao' | 'administrador' | 'pagamento';

const TAB_LABELS: Record<Tab, string> = {
    organizacao: 'Organização',
    administrador: 'Administrador',
    pagamento: 'Pagamento',
};

const TAB_ORDER: Tab[] = ['organizacao', 'administrador', 'pagamento'];

type CheckoutClientProps = {
    planId: string | null;
    totalSensors: number;
    hardwareParam: string | null;
};

export function CheckoutClient({ planId, totalSensors, hardwareParam }: CheckoutClientProps) {
    const selectedHardware = hardwareParam ? JSON.parse(decodeURIComponent(hardwareParam)) : [];

    // ─── Form state (UNCHANGED) ────────────────────────────────────────────────
    const methods = useForm<CheckoutFormValues>({
        defaultValues: {
            country: 'PT',
            hasDifferentShippingAddress: false,
            billingAddress: { country: 'PT' },
            shippingAddress: { country: 'PT' },
        },
    });

    // ─── Local UI state ────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<Tab>('organizacao');
    const [isValidatingVat, setIsValidatingVat] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    /**
     * Separate loading state that tracks the async Auth0 + Stripe initialisation
     * between Tab 2 "Continuar" click and Tab 3 appearing.
     * react-hook-form's own `formState.isSubmitting` resets too early here because
     * we advance the tab *after* the action resolves, so we track it manually.
     */
    const [isCreatingIntent, setIsCreatingIntent] = useState(false);

    if (!planId) {
        return <div className="text-center p-12 text-muted-foreground">Nenhum plano de software selecionado.</div>;
    }

    // ─── VIES handler (UNCHANGED) ──────────────────────────────────────────────
    const handleVatBlur = async () => {
        const currentName = methods.getValues('organizationName');
        if (currentName && currentName.trim() !== '') return;

        const currentVat = methods.getValues('nif');
        if (!currentVat || currentVat.length < 3) return;

        setIsValidatingVat(true);
        try {
            const currentCountry = methods.getValues('country') || 'PT';
            const res = await validateVatAction(currentVat, currentCountry);

            if (res.success) {
                methods.setValue('organizationName', res.name, { shouldValidate: true });
                if (res.address) {
                    methods.setValue('billingAddress.streetAddress', res.address, { shouldValidate: true });
                }
                if (res.postalCode) {
                    methods.setValue('billingAddress.postalCode', res.postalCode, { shouldValidate: true });
                }
                if (res.city) {
                    methods.setValue('billingAddress.city', res.city, { shouldValidate: true });
                }
            } else {
                console.warn('VIES Validation Failed:', res.error);
            }
        } catch (error) {
            console.error('Unexpected error validating VAT:', error);
        } finally {
            setIsValidatingVat(false);
        }
    };

    // ─── Submit (UNCHANGED) ────────────────────────────────────────────────────
    const onSubmit = async (data: CheckoutFormValues) => {
        setSubmitError(null);
        setIsCreatingIntent(true);

        try {
            const formData: CheckoutFormData = {
                organizationName: data.organizationName,
                departmentName: data.departmentName,
                nif: data.nif,
                internalReference: data.internalReference,
                adminFullName: data.adminFullName,
                adminEmail: data.adminEmail,
                jobTitle: data.jobTitle,
                phone: data.phone,
                billingAddress: data.billingAddress,
                shippingAddress: data.hasDifferentShippingAddress ? data.shippingAddress : undefined,
            };

            const lineItems = [{ price: planId, quantity: 1 }];
            const result = await createSubscriptionIntent(formData, lineItems, totalSensors, selectedHardware);

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
                setActiveTab('pagamento');
            }
        } catch (err: any) {
            setSubmitError(err.message || 'Falha ao inicializar o checkout.');
        } finally {
            setIsCreatingIntent(false);
        }
    };

    // ─── Tab progression guards ────────────────────────────────────────────────
    const handleContinuarOrganizacao = async () => {
        const valid = await methods.trigger([
            'country',
            'nif',
            'organizationName',
            'billingAddress.streetAddress',
            'billingAddress.postalCode',
            'billingAddress.city',
            'departmentName',
        ]);
        if (valid) setActiveTab('administrador');
    };

    const handleContinuarAdministrador = async () => {
        const valid = await methods.trigger(['adminFullName', 'adminEmail', 'jobTitle', 'phone']);
        if (valid) {
            // Fire the full form submit — this calls Auth0 + Stripe.
            // isCreatingIntent ensures the button is disabled until we land on Tab 3.
            methods.handleSubmit(onSubmit)();
        }
    };

    return (
        // ─── 2-column page layout ──────────────────────────────────────────────
        <main className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">

                {/* ── LEFT COLUMN — scrollable form ────────────────────────── */}
                <div className="overflow-y-auto max-h-[calc(100vh-6rem)] pb-12 pr-1">

                    {/* Tab breadcrumb navigation */}
                    <nav className="flex items-center gap-0 mb-8" aria-label="Etapas do checkout">
                        {TAB_ORDER.map((tab, idx) => {
                            const isActive = tab === activeTab;
                            const isPast = TAB_ORDER.indexOf(activeTab) > idx;
                            return (
                                <React.Fragment key={tab}>
                                    <button
                                        type="button"
                                        disabled={!isPast}
                                        onClick={() => isPast && setActiveTab(tab)}
                                        className={cn(
                                            'text-sm font-medium transition-colors pb-1',
                                            isActive
                                                ? 'text-foreground border-b-2 border-foreground'
                                                : isPast
                                                    ? 'text-muted-foreground hover:text-foreground cursor-pointer'
                                                    : 'text-muted-foreground/50 cursor-default',
                                        )}
                                        aria-current={isActive ? 'step' : undefined}
                                    >
                                        {TAB_LABELS[tab]}
                                    </button>
                                    {idx < TAB_ORDER.length - 1 && (
                                        <span className="mx-3 text-muted-foreground/40 select-none">·</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </nav>

                    {/* FormProvider — all tab children use useFormContext() locally */}
                    <FormProvider {...methods}>
                        <form onSubmit={(e) => e.preventDefault()} noValidate>

                            {activeTab === 'organizacao' && (
                                <OrganizacaoTab
                                    isValidatingVat={isValidatingVat}
                                    onVatBlur={handleVatBlur}
                                    onContinuar={handleContinuarOrganizacao}
                                />
                            )}

                            {activeTab === 'administrador' && (
                                <AdministradorTab
                                    onContinuar={handleContinuarAdministrador}
                                    isCreatingIntent={isCreatingIntent}
                                    submitError={submitError}
                                />
                            )}

                            {activeTab === 'pagamento' && clientSecret && (
                                <Elements
                                    stripe={stripePromise}
                                    options={{ clientSecret, appearance: { theme: 'stripe' } }}
                                >
                                    <StripePaymentForm
                                        clientSecret={clientSecret}
                                        onCancel={() => {
                                            setClientSecret(null);
                                            setActiveTab('administrador');
                                        }}
                                    />
                                </Elements>
                            )}

                        </form>
                    </FormProvider>
                </div>

                {/* ── RIGHT COLUMN — sticky summary ────────────────────────── */}
                <div className="sticky top-8 self-start">
                    <CheckoutSummaryPanel />
                </div>

            </div>
        </main>
    );
}

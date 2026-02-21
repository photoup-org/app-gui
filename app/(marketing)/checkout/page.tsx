'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSubscriptionIntent, CheckoutFormData } from '@/app/actions/stripe';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function StripePaymentForm({ clientSecret, onCancel }: { clientSecret: string; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        let resultError;
        if (clientSecret.startsWith('seti_')) {
            const { error } = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
            });
            resultError = error;
        } else {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
            });
            resultError = error;
        }

        if (resultError) {
            setErrorMessage(resultError.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Complete Payment</h3>
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="w-full"
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
            </div>
        </form>
    );
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan_id');

    // Admin Details
    const [adminFullName, setAdminFullName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [phone, setPhone] = useState('');

    // Company & Workspace
    const [organizationName, setOrganizationName] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [nif, setNif] = useState('');
    const [internalReference, setInternalReference] = useState('');

    // Addresses
    const [billingAddress, setBillingAddress] = useState({ streetAddress: '', city: '', postalCode: '', country: '' });
    const [shippingAddress, setShippingAddress] = useState({ streetAddress: '', city: '', postalCode: '', country: '' });
    const [hasDifferentShippingAddress, setHasDifferentShippingAddress] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    if (!planId) {
        return <div className="text-center p-12">No software plan selected.</div>;
    }

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData: CheckoutFormData = {
                organizationName,
                departmentName,
                nif,
                internalReference,
                adminFullName,
                adminEmail,
                jobTitle,
                phone,
                billingAddress,
                shippingAddress: hasDifferentShippingAddress ? shippingAddress : undefined,
            };

            const lineItems = [
                { price: planId, quantity: 1 }
                // { price: 'price_XXXXXX', quantity: 2 } // Example hardware injection
            ];

            const result = await createSubscriptionIntent(formData, lineItems);

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to initialize checkout.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-zinc-900 shadow sm:rounded-lg p-6 sm:p-10">

                    {!clientSecret ? (
                        <>
                            <div className="mb-8 border-b border-gray-200 dark:border-zinc-700 pb-5">
                                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                                    Setup your Workspace
                                </h2>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Provide your company information. Only one admin is required to create the workspace;
                                    passwords and team invitations will be handled after checkout.
                                </p>
                            </div>

                            <form onSubmit={handleSetupSubmit} className="space-y-8">
                                {/* Company Details */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">1. Company Details</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <FormField
                                            label="Organization Name"
                                            placeholder="e.g. Acme Corp"
                                            required
                                            value={organizationName}
                                            onChange={setOrganizationName}
                                        />
                                        <FormField
                                            label="NIF / VAT Number"
                                            required
                                            value={nif}
                                            onChange={setNif}
                                        />
                                        <FormField
                                            label="Department / Workspace Name"
                                            placeholder="e.g. Science Lab 1"
                                            required
                                            value={departmentName}
                                            onChange={setDepartmentName}
                                            className="space-y-2 sm:col-span-2"
                                        />
                                    </div>
                                </div>

                                {/* Admin Details */}
                                <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">2. Admin Details</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <FormField
                                            label="Full Name"
                                            required
                                            value={adminFullName}
                                            onChange={setAdminFullName}
                                        />
                                        <FormField
                                            label="Work Email"
                                            type="email"
                                            required
                                            value={adminEmail}
                                            onChange={setAdminEmail}
                                        />
                                        <FormField
                                            label="Job Title"
                                            required
                                            value={jobTitle}
                                            onChange={setJobTitle}
                                        />
                                        <FormField
                                            label="Phone Number"
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={setPhone}
                                        />
                                    </div>
                                </div>

                                {/* Billing */}
                                <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">3. Billing & Logistic Information</h3>

                                    <FormField
                                        label="Internal Reference / PO Number (Optional)"
                                        value={internalReference}
                                        onChange={setInternalReference}
                                        className="space-y-2 mb-6"
                                    />

                                    <AddressForm
                                        title="Billing Address"
                                        address={billingAddress}
                                        setAddress={setBillingAddress}
                                        required={true}
                                    />

                                    <div className="flex items-center space-x-2 mt-6 py-4">
                                        <Checkbox
                                            id="different-shipping"
                                            checked={hasDifferentShippingAddress}
                                            onCheckedChange={(checked: boolean) => setHasDifferentShippingAddress(checked)}
                                        />
                                        <Label htmlFor="different-shipping">Use a different address for Shipping</Label>
                                    </div>

                                    {hasDifferentShippingAddress && (
                                        <AddressForm
                                            title="Shipping Address"
                                            address={shippingAddress}
                                            setAddress={setShippingAddress}
                                            required={hasDifferentShippingAddress}
                                        />
                                    )}
                                </div>

                                {error && <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</div>}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full text-lg py-6"
                                    >
                                        {isSubmitting ? 'Initializing Payment...' : 'Continue to Payment'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <StripePaymentForm clientSecret={clientSecret} onCancel={() => setClientSecret(null)} />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reusable Address Form Component
const AddressForm = ({
    title,
    address,
    setAddress,
    required
}: {
    title: string,
    address: any,
    setAddress: any,
    required: boolean
}) => (
    <div className="border-t border-gray-200 dark:border-zinc-700 pt-4 mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormField
                label="Street Address"
                required={required}
                value={address.streetAddress}
                onChange={(val) => setAddress({ ...address, streetAddress: val })}
                className="sm:col-span-6 space-y-2"
            />
            <FormField
                label="City"
                required={required}
                value={address.city}
                onChange={(val) => setAddress({ ...address, city: val })}
                className="sm:col-span-3 space-y-2"
            />
            <FormField
                label="Postal Code"
                required={required}
                value={address.postalCode}
                onChange={(val) => setAddress({ ...address, postalCode: val })}
                className="sm:col-span-3 space-y-2"
            />
            <FormField
                label="Country"
                required={required}
                value={address.country}
                onChange={(val) => setAddress({ ...address, country: val })}
                className="sm:col-span-6 space-y-2"
            />
        </div>
    </div>
);

// Reusable Form Field Component
const FormField = ({
    id,
    label,
    value,
    onChange,
    required = false,
    type = "text",
    placeholder,
    className = "space-y-2",
}: {
    id?: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    className?: string; // For the wrapper div
}) => (
    <div className={className}>
        <Label htmlFor={id}>{label}</Label>
        <Input
            id={id}
            type={type}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
        />
    </div>
);

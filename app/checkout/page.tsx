'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/CheckoutForm';
import { createStripeSubscription } from '@/app/actions/stripe';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan_id');

    // Guest User State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [nif, setNif] = useState('');
    const [address, setAddress] = useState({ line1: '', city: '', postal_code: '', country: '' });
    const [billingAddress, setBillingAddress] = useState({ line1: '', city: '', postal_code: '', country: '' });
    const [sameAsAddress, setSameAsAddress] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!planId) {
        return <div className="text-center p-12">No plan selected.</div>;
    }

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleCreateSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            const finalBillingAddress = sameAsAddress ? address : billingAddress;

            const result = await createStripeSubscription(email, name, planId, {
                nif,
                address,
                billingAddress: finalBillingAddress,
            });

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to start subscription.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Complete your subscription
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Step 1: Guest Information */}
                    {!clientSecret && (
                        <form onSubmit={handleCreateSubscription} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="workEmail">Work Email</Label>
                                <Input
                                    id="workEmail"
                                    name="workEmail"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nif">NIF/VAT Number</Label>
                                <Input
                                    id="nif"
                                    name="nif"
                                    type="text"
                                    required
                                    value={nif}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNif(e.target.value)}
                                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                />
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Address</h3>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-6 space-y-2">
                                        <Label htmlFor="address-line1">Street Address</Label>
                                        <Input
                                            type="text"
                                            id="address-line1"
                                            name="address-line1"
                                            required
                                            value={address.line1}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, line1: e.target.value })}
                                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="sm:col-span-3 space-y-2">
                                        <Label htmlFor="address-city">City</Label>
                                        <Input
                                            type="text"
                                            id="address-city"
                                            name="address-city"
                                            required
                                            value={address.city}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, city: e.target.value })}
                                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="sm:col-span-3 space-y-2">
                                        <Label htmlFor="address-postal-code">Postal Code</Label>
                                        <Input
                                            type="text"
                                            id="address-postal-code"
                                            name="address-postal-code"
                                            required
                                            value={address.postal_code}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, postal_code: e.target.value })}
                                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="sm:col-span-6 space-y-2">
                                        <Label htmlFor="address-country">Country</Label>
                                        <Input
                                            type="text"
                                            id="address-country"
                                            name="address-country"
                                            required
                                            value={address.country}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress({ ...address, country: e.target.value })}
                                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="same-as-address"
                                    checked={sameAsAddress}
                                    onCheckedChange={(checked: boolean) => setSameAsAddress(checked)}
                                />
                                <Label htmlFor="same-as-address">Billing address is the same as above</Label>
                            </div>

                            {!sameAsAddress && (
                                <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Billing Address</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-6 space-y-2">
                                            <Label htmlFor="billing-address-line1">Street Address</Label>
                                            <Input
                                                type="text"
                                                id="billing-address-line1"
                                                name="billing-address-line1"
                                                required={!sameAsAddress}
                                                value={billingAddress.line1}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="sm:col-span-3 space-y-2">
                                            <Label htmlFor="billing-address-city">City</Label>
                                            <Input
                                                type="text"
                                                id="billing-address-city"
                                                name="billing-address-city"
                                                required={!sameAsAddress}
                                                value={billingAddress.city}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="sm:col-span-3 space-y-2">
                                            <Label htmlFor="billing-address-postal-code">Postal Code</Label>
                                            <Input
                                                type="text"
                                                id="billing-address-postal-code"
                                                name="billing-address-postal-code"
                                                required={!sameAsAddress}
                                                value={billingAddress.postal_code}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="sm:col-span-6 space-y-2">
                                            <Label htmlFor="billing-address-country">Country</Label>
                                            <Input
                                                type="text"
                                                id="billing-address-country"
                                                name="billing-address-country"
                                                required={!sameAsAddress}
                                                value={billingAddress.country}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Payment */}
                    {clientSecret && (
                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}

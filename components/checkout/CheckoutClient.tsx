'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createSubscriptionIntent } from '@/actions/stripe';
import { validateVatAction } from '@/actions/vies';
import { CheckoutFormData, CheckoutFormValues } from '@/types/checkout';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';
import { AddressForm } from '@/components/checkout/AddressForm';
import { FormField } from '@/components/checkout/FormField';

// Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type CheckoutClientProps = {
    planId: string | null;
    totalSensors: number;
    hardwareParam: string | null;
};

export function CheckoutClient({ planId, totalSensors, hardwareParam }: CheckoutClientProps) {
    const selectedHardware = hardwareParam ? JSON.parse(decodeURIComponent(hardwareParam)) : [];

    const { register, handleSubmit, watch, setValue, getValues, control, formState: { errors, isSubmitting: formIsSubmitting } } = useForm<CheckoutFormValues>({
        defaultValues: {
            country: 'PT',
            hasDifferentShippingAddress: false,
            billingAddress: { country: 'PT' },
            shippingAddress: { country: 'PT' },
        }
    });

    const hasDifferentShippingAddress = watch('hasDifferentShippingAddress');

    const [isValidatingVat, setIsValidatingVat] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    if (!planId) {
        return <div className="text-center p-12">No software plan selected.</div>;
    }

    const handleVatBlur = async () => {
        const currentName = getValues("organizationName");
        if (currentName && currentName.trim() !== '') return;

        const currentVat = getValues("nif");
        if (!currentVat || currentVat.length < 3) return;

        setIsValidatingVat(true);
        try {
            const currentCountry = getValues("country") || "PT";
            const res = await validateVatAction(currentVat, currentCountry);

            if (res.success) {
                setValue("organizationName", res.name, { shouldValidate: true });
                if (res.address) {
                    setValue("billingAddress.streetAddress", res.address, { shouldValidate: true });
                }
                if (res.postalCode) {
                    setValue("billingAddress.postalCode", res.postalCode, { shouldValidate: true });
                }
                if (res.city) {
                    setValue("billingAddress.city", res.city, { shouldValidate: true });
                }
            } else {
                console.warn("VIES Validation Failed:", res.error);
            }
        } catch (error) {
            console.error("Unexpected error validating VAT:", error);
        } finally {
            setIsValidatingVat(false);
        }
    };

    const onSubmit = async (data: CheckoutFormValues) => {
        setSubmitError(null);

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

            const lineItems = [
                { price: planId, quantity: 1 }
            ];

            const result = await createSubscriptionIntent(formData, lineItems, totalSensors, selectedHardware);

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
            }
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to initialize checkout.');
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

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Company Details */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">1. Company Details</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="country">Country</Label>
                                            <select
                                                id="country"
                                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 dark:text-white"
                                                {...register("country")}
                                            >
                                                <option value="PT">Portugal (PT)</option>
                                                <option value="ES">Spain (ES)</option>
                                                <option value="FR">France (FR)</option>
                                                <option value="DE">Germany (DE)</option>
                                                <option value="IT">Italy (IT)</option>
                                                <option value="IE">Ireland (IE)</option>
                                                <option value="NL">Netherlands (NL)</option>
                                                <option value="BE">Belgium (BE)</option>
                                                {/* Add more as needed */}
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <FormField
                                                label="NIF / VAT Number"
                                                {...register("nif", {
                                                    required: "VAT is required",
                                                    onBlur: handleVatBlur
                                                })}
                                                error={errors.nif?.message}
                                            />
                                            {isValidatingVat && (
                                                <div className="absolute right-3 top-[34px]">
                                                    <span className="text-xs text-gray-500 animate-pulse">Checking...</span>
                                                </div>
                                            )}
                                        </div>
                                        <FormField
                                            label="Organization Name"
                                            placeholder="e.g. Acme Corp"
                                            {...register("organizationName", { required: "Organization name is required" })}
                                            error={errors.organizationName?.message}
                                        />
                                        <FormField
                                            label="Department / Workspace Name"
                                            placeholder="e.g. Science Lab 1"
                                            className="space-y-2 sm:col-span-2"
                                            {...register("departmentName", { required: "Department name is required" })}
                                            error={errors.departmentName?.message}
                                        />
                                    </div>
                                </div>

                                {/* Admin Details */}
                                <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">2. Admin Details</h3>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <FormField
                                            label="Full Name"
                                            {...register("adminFullName", { required: "Admin name is required" })}
                                            error={errors.adminFullName?.message}
                                        />
                                        <FormField
                                            label="Work Email"
                                            type="email"
                                            {...register("adminEmail", { required: "Admin email is required" })}
                                            error={errors.adminEmail?.message}
                                        />
                                        <FormField
                                            label="Job Title"
                                            {...register("jobTitle", { required: "Job title is required" })}
                                            error={errors.jobTitle?.message}
                                        />
                                        <FormField
                                            label="Phone Number"
                                            type="tel"
                                            {...register("phone", { required: "Phone is required" })}
                                            error={errors.phone?.message}
                                        />
                                    </div>
                                </div>

                                {/* Billing */}
                                <div className="mt-8 border-t border-gray-200 dark:border-zinc-700 pt-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">3. Billing & Logistic Information</h3>

                                    <FormField
                                        label="Internal Reference / PO Number (Optional)"
                                        className="space-y-2 mb-6"
                                        {...register("internalReference")}
                                    />

                                    <AddressForm
                                        title="Billing Address"
                                        prefix="billingAddress"
                                        register={register}
                                        errors={errors}
                                        required={true}
                                    />

                                    <div className="flex items-center space-x-2 mt-6 py-4">
                                        <Controller
                                            name="hasDifferentShippingAddress"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="different-shipping"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                        <Label htmlFor="different-shipping">Use a different address for Shipping</Label>
                                    </div>

                                    {hasDifferentShippingAddress && (
                                        <AddressForm
                                            title="Shipping Address"
                                            prefix="shippingAddress"
                                            register={register}
                                            errors={errors}
                                            required={hasDifferentShippingAddress}
                                        />
                                    )}
                                </div>

                                {submitError && <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-md">{submitError}</div>}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={formIsSubmitting}
                                        className="w-full text-lg py-6"
                                    >
                                        {formIsSubmitting ? 'Initializing Payment...' : 'Continue to Payment'}
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


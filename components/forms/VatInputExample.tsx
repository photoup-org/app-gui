"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { validateVatAction } from "@/actions/vies";

type OrganizationFormValues = {
    vat: string;
    organizationName: string;
    address: string;
};

export function VatInputExample() {
    const [isValidatingVat, setIsValidatingVat] = useState(false);

    const form = useForm<OrganizationFormValues>({
        defaultValues: {
            vat: "",
            organizationName: "",
            address: "",
        },
    });

    const handleVatBlur = async () => {
        const currentName = form.getValues("organizationName");
        if (currentName && currentName.trim() !== "") return;

        const currentVat = form.getValues("vat");

        // Don't validate if empty or too short to be a valid VAT
        if (!currentVat || currentVat.length < 3) return;

        setIsValidatingVat(true);

        try {
            // we have to cast since we did not add country to OrganizationFormValues in this file yet.
            const currentCountry = (form.getValues() as any).country || "PT";
            const res = await validateVatAction(currentVat, currentCountry);

            if (res.success) {
                // Auto-fill the inputs. We don't disable them so user can still edit!
                form.setValue("organizationName", res.name, { shouldValidate: true });
                form.setValue("address", res.address, { shouldValidate: true });
            } else {
                // Optionally show an error message or toast telling the user to fill manually
                console.warn("VIES Validation Failed:", res.error);
                // form.setError("vat", { type: "manual", message: res.error });
            }
        } catch (error) {
            console.error("Unexpected error validating VAT:", error);
        } finally {
            setIsValidatingVat(false);
        }
    };

    return (
        <form className="space-y-4 max-w-md bg-white p-6 rounded shadow">
            <div className="flex flex-col gap-1">
                <label htmlFor="vat" className="text-sm font-medium">VAT Number</label>
                <div className="relative">
                    <input
                        id="vat"
                        type="text"
                        placeholder="e.g. PT500000000"
                        className="border p-2 rounded w-full pr-10"
                        {...form.register("vat", {
                            onBlur: handleVatBlur,
                        })}
                    />
                    {isValidatingVat && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="text-xs text-gray-500 animate-pulse">Checking...</span>
                        </div>
                    )}
                </div>
                {form.formState.errors.vat && (
                    <span className="text-red-500 text-xs">{form.formState.errors.vat.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="organizationName" className="text-sm font-medium">Organization Name</label>
                <input
                    id="organizationName"
                    type="text"
                    className="border p-2 rounded w-full"
                    {...form.register("organizationName")}
                />
                <p className="text-xs text-gray-400">Auto-filled if valid VAT, but you can edit.</p>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <textarea
                    id="address"
                    rows={3}
                    className="border p-2 rounded w-full"
                    {...form.register("address")}
                />
                <p className="text-xs text-gray-400">Auto-filled if valid VAT, but you can edit.</p>
            </div>

            <button
                type="button"
                onClick={() => console.log(form.getValues())}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                Submit
            </button>
        </form>
    );
}

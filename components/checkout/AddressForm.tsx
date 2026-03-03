import React from 'react';
import { FormField } from "./FormField";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export const AddressForm = ({
    title,
    prefix,
    register,
    required = false,
    errors
}: {
    title: string;
    prefix: string;
    register: UseFormRegister<any>;
    required?: boolean;
    errors?: Record<string, any>;
}) => {
    // Helper to extract nested error message
    const getError = (field: string) => {
        if (!errors) return undefined;
        let obj: any = errors;
        const keys = `${prefix}.${field}`.split('.');
        for (const key of keys) {
            if (obj && obj[key]) obj = obj[key];
            else return undefined;
        }
        return obj?.message as string | undefined;
    };

    return (
        <div className="border-t border-gray-200 dark:border-zinc-700 pt-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                    id={`${title.toLowerCase().replace(' ', '-')}-street`}
                    label="Street Address"
                    {...register(`${prefix}.streetAddress`, { required: required ? "Street Address is required" : false })}
                    error={getError("streetAddress")}
                    className="sm:col-span-6 space-y-2"
                />
                <FormField
                    id={`${title.toLowerCase().replace(' ', '-')}-city`}
                    label="City"
                    {...register(`${prefix}.city`, { required: required ? "City is required" : false })}
                    error={getError("city")}
                    className="sm:col-span-3 space-y-2"
                />
                <FormField
                    id={`${title.toLowerCase().replace(' ', '-')}-postal`}
                    label="Postal Code"
                    {...register(`${prefix}.postalCode`, { required: required ? "Postal Code is required" : false })}
                    error={getError("postalCode")}
                    className="sm:col-span-3 space-y-2"
                />
                <FormField
                    id={`${title.toLowerCase().replace(' ', '-')}-country`}
                    label="Country"
                    {...register(`${prefix}.country`, { required: required ? "Country is required" : false })}
                    error={getError("country")}
                    className="sm:col-span-6 space-y-2"
                />
            </div>
        </div>
    );
};

import React from 'react';
import { FormField } from "./FormField";

export const AddressForm = ({
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
                id={`${title.toLowerCase().replace(' ', '-')}-street`}
                label="Street Address"
                required={required}
                value={address.streetAddress}
                onChange={(val) => setAddress({ ...address, streetAddress: val })}
                className="sm:col-span-6 space-y-2"
            />
            <FormField
                id={`${title.toLowerCase().replace(' ', '-')}-city`}
                label="City"
                required={required}
                value={address.city}
                onChange={(val) => setAddress({ ...address, city: val })}
                className="sm:col-span-3 space-y-2"
            />
            <FormField
                id={`${title.toLowerCase().replace(' ', '-')}-postal`}
                label="Postal Code"
                required={required}
                value={address.postalCode}
                onChange={(val) => setAddress({ ...address, postalCode: val })}
                className="sm:col-span-3 space-y-2"
            />
            <FormField
                id={`${title.toLowerCase().replace(' ', '-')}-country`}
                label="Country"
                required={required}
                value={address.country}
                onChange={(val) => setAddress({ ...address, country: val })}
                className="sm:col-span-6 space-y-2"
            />
        </div>
    </div>
);

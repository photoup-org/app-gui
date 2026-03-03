import React, { forwardRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string; // For the wrapper div
    error?: string; // Optional error message
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
    ({ id, label, className = "space-y-2", error, ...props }, ref) => {
        const generatedId = id || `input-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        return (
            <div className={className}>
                <Label htmlFor={generatedId}>{label}</Label>
                <Input
                    {...props}
                    ref={ref}
                    id={generatedId}
                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                />
                {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
            </div>
        );
    }
);
FormField.displayName = "FormField";

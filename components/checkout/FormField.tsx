import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const FormField = ({
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
}) => {
    const generatedId = id || `input-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    return (
        <div className={className}>
            <Label htmlFor={generatedId}>{label}</Label>
            <Input
                id={generatedId}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
        </div>
    );
};

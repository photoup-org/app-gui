'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CheckoutFormValues } from '@/types/checkout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AddressForm } from '@/components/marketing/checkout/AddressForm';
import { cn } from '@/lib/utils';

// Country options for the País select
const EU_COUNTRIES = [
    { code: 'PT', label: 'Portugal' },
    { code: 'ES', label: 'Espanha' },
    { code: 'FR', label: 'França' },
    { code: 'DE', label: 'Alemanha' },
    { code: 'IT', label: 'Itália' },
    { code: 'IE', label: 'Irlanda' },
    { code: 'NL', label: 'Países Baixos' },
    { code: 'BE', label: 'Bélgica' },
    { code: 'OTHER', label: 'Outro' },
] as const;

interface OrganizacaoTabProps {
    /** Passed down from CheckoutClient — only a boolean flag, not the form state */
    isValidatingVat: boolean;
    /** Stable callback ref from CheckoutClient — does not change per render */
    onVatBlur: () => Promise<void>;
    onContinuar: () => Promise<void>;
}

/**
 * Tab 1 — Organização
 *
 * Uses `useFormContext<CheckoutFormValues>()` to subscribe to the form.
 * Re-renders are isolated to this component: the parent `CheckoutClient`
 * (and the `CheckoutSummaryPanel`) are not re-rendered on every keystroke.
 */
export function OrganizacaoTab({ isValidatingVat, onVatBlur, onContinuar }: OrganizacaoTabProps) {
    const {
        register,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useFormContext<CheckoutFormValues>();

    // Local subscription — only this component re-renders when this field changes
    const hasDifferentShippingAddress = watch('hasDifferentShippingAddress');

    return (
        <div className="space-y-5">

            {/* País */}
            <div className="space-y-1.5">
                <Label htmlFor="country">País<span className="text-destructive ml-0.5">*</span></Label>
                <select
                    id="country"
                    {...register('country')}
                    className={cn(
                        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
                        'text-sm text-foreground ring-offset-background',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    {EU_COUNTRIES.map(({ code, label }) => (
                        <option key={code} value={code}>{label}</option>
                    ))}
                </select>
            </div>

            {/* NIF / VAT */}
            <div className="relative space-y-1.5">
                <Label htmlFor="nif">NIF/VAT<span className="text-destructive ml-0.5">*</span></Label>
                <Input
                    id="nif"
                    placeholder="123456789"
                    {...register('nif', {
                        required: 'NIF/VAT é obrigatório',
                        onBlur: onVatBlur,
                    })}
                    aria-invalid={!!errors.nif}
                />
                {isValidatingVat && (
                    <span className="absolute right-3 top-[34px] flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        A verificar…
                    </span>
                )}
                {errors.nif && (
                    <p role="alert" className="text-destructive text-xs mt-1">{errors.nif.message}</p>
                )}
            </div>

            {/* Nome da Organização */}
            <div className="space-y-1.5">
                <Label htmlFor="organizationName">Organização<span className="text-destructive ml-0.5">*</span></Label>
                <Input
                    id="organizationName"
                    placeholder="Empresa XPTO, Lda"
                    {...register('organizationName', { required: 'Nome da organização é obrigatório' })}
                    aria-invalid={!!errors.organizationName}
                />
                {errors.organizationName && (
                    <p role="alert" className="text-destructive text-xs mt-1">{errors.organizationName.message}</p>
                )}
            </div>

            {/* Morada (billing street) */}
            <div className="space-y-1.5">
                <Label htmlFor="billingStreet">Morada<span className="text-destructive ml-0.5">*</span></Label>
                <Input
                    id="billingStreet"
                    placeholder="Rua XPTO n100"
                    {...register('billingAddress.streetAddress', { required: 'Morada é obrigatória' })}
                    aria-invalid={!!errors.billingAddress?.streetAddress}
                />
                <p className="text-xs text-muted-foreground">
                    Esta morada será utilizada para enviar o hardware associado ao seu plano
                </p>
                {errors.billingAddress?.streetAddress && (
                    <p role="alert" className="text-destructive text-xs">{errors.billingAddress.streetAddress.message}</p>
                )}
            </div>

            {/* Código Postal + Localidade — 2 col */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="postalCode">Código Postal<span className="text-destructive ml-0.5">*</span></Label>
                    <Input
                        id="postalCode"
                        placeholder="1000-100"
                        {...register('billingAddress.postalCode', { required: 'Código postal é obrigatório' })}
                        aria-invalid={!!errors.billingAddress?.postalCode}
                    />
                    {errors.billingAddress?.postalCode && (
                        <p role="alert" className="text-destructive text-xs mt-1">{errors.billingAddress.postalCode.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="city">Localidade<span className="text-destructive ml-0.5">*</span></Label>
                    <Input
                        id="city"
                        placeholder="Vila Nova de Gaia"
                        {...register('billingAddress.city', { required: 'Localidade é obrigatória' })}
                        aria-invalid={!!errors.billingAddress?.city}
                    />
                    {errors.billingAddress?.city && (
                        <p role="alert" className="text-destructive text-xs mt-1">{errors.billingAddress.city.message}</p>
                    )}
                </div>
            </div>

            {/* Departamento / Laboratório */}
            <div className="space-y-1.5">
                <Label htmlFor="departmentName">
                    Departamento/Laboratório<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                    id="departmentName"
                    placeholder="Departamento XPTO"
                    {...register('departmentName', { required: 'Nome do departamento é obrigatório' })}
                    aria-invalid={!!errors.departmentName}
                />
                <p className="text-xs text-muted-foreground">
                    Este nome será utilizado para definir o seu Workspace
                </p>
                {errors.departmentName && (
                    <p role="alert" className="text-destructive text-xs">{errors.departmentName.message}</p>
                )}
            </div>

            {/* Referência Interna (optional) */}
            <div className="space-y-1.5">
                <Label htmlFor="internalReference">Referência Interna</Label>
                <Input
                    id="internalReference"
                    placeholder="E.g., Nota de Encomenda"
                    {...register('internalReference')}
                />
                <p className="text-xs text-muted-foreground">
                    Informação extra que vai aparecer na sua fatura
                </p>
            </div>

            {/* ── Morada de expedição diferente? ────────────────────────── */}
            <div className="border-t border-border pt-4">
                <Controller
                    name="hasDifferentShippingAddress"
                    control={control}
                    render={({ field }) => (
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                id="different-shipping"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                Morada de expedição diferente?
                            </span>
                        </label>
                    )}
                />

                {hasDifferentShippingAddress && (
                    <div className="mt-4">
                        <AddressForm
                            title="Morada de Expedição"
                            prefix="shippingAddress"
                            register={register}
                            errors={errors}
                            required={true}
                        />
                    </div>
                )}
            </div>

            {/* Continuar */}
            <div className="pt-4">
                <Button
                    type="button"
                    onClick={onContinuar}
                    disabled={isSubmitting}
                    className="w-full bg-[#2DCFBE] hover:bg-[#26b8a8] text-white font-semibold py-3 h-12 text-base rounded-lg transition-colors"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
}

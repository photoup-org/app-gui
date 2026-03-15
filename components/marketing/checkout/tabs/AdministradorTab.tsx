'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '@/types/checkout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdministradorTabProps {
    onContinuar: () => Promise<void>;
    isCreatingIntent: boolean;
    submitError: string | null;
}

/**
 * Tab 2 — Administrador
 *
 * Uses useFormContext<CheckoutFormValues>() to subscribe locally.
 * The isCreatingIntent prop is a boolean flag — it does NOT pass form state,
 * so it will not trigger parent re-renders.
 */
export function AdministradorTab({ onContinuar, isCreatingIntent, submitError }: AdministradorTabProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext<CheckoutFormValues>();

    return (
        <div className="space-y-5">

            {/* Nome Completo */}
            <div className="space-y-1.5">
                <Label htmlFor="adminFullName">
                    Nome Completo<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                    id="adminFullName"
                    placeholder="John Doe"
                    {...register('adminFullName', { required: 'Nome completo é obrigatório' })}
                    aria-invalid={!!errors.adminFullName}
                />
                {errors.adminFullName && (
                    <p role="alert" className="text-destructive text-xs mt-1">{errors.adminFullName.message}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <Label htmlFor="adminEmail">
                    Email<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@photoup.pt"
                    {...register('adminEmail', {
                        required: 'Email é obrigatório',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email inválido',
                        },
                    })}
                    aria-invalid={!!errors.adminEmail}
                />
                {errors.adminEmail && (
                    <p role="alert" className="text-destructive text-xs mt-1">{errors.adminEmail.message}</p>
                )}
            </div>

            {/* Cargo */}
            <div className="space-y-1.5">
                <Label htmlFor="jobTitle">
                    Cargo<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                    id="jobTitle"
                    placeholder="Engenheiro de Software"
                    {...register('jobTitle', { required: 'Cargo é obrigatório' })}
                    aria-invalid={!!errors.jobTitle}
                />
                {errors.jobTitle && (
                    <p role="alert" className="text-destructive text-xs mt-1">{errors.jobTitle.message}</p>
                )}
            </div>

            {/* Telemóvel / Telefone */}
            <div className="space-y-1.5">
                <Label htmlFor="phone">
                    Telemóvel/Telefone<span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+351 910 000 000"
                    {...register('phone', { required: 'Telemóvel é obrigatório' })}
                    aria-invalid={!!errors.phone}
                />
                <p className="text-xs text-muted-foreground">
                    Necessário para a transportadora contactar na entrega.
                </p>
                {errors.phone && (
                    <p role="alert" className="text-destructive text-xs">{errors.phone.message}</p>
                )}
            </div>

            {/* Server-side submit error */}
            {submitError && (
                <div
                    role="alert"
                    className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20"
                >
                    {submitError}
                </div>
            )}

            {/* Continuar — disabled + spinner while Auth0 + Stripe initialise */}
            <div className="pt-4">
                <Button
                    type="button"
                    onClick={onContinuar}
                    disabled={isCreatingIntent}
                    className="w-full bg-[#2DCFBE] hover:bg-[#26b8a8] text-white font-semibold py-3 h-12 text-base rounded-lg transition-colors disabled:opacity-70"
                >
                    {isCreatingIntent ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            A preparar pagamento…
                        </span>
                    ) : (
                        'Continuar'
                    )}
                </Button>
            </div>
        </div>
    );
}

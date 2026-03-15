import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";

export function StripePaymentForm({ clientSecret, onCancel }: { clientSecret: string; onCancel: () => void }) {
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

        // Required: Trigger form validation and wallet collection
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || 'Validation error.');
            setIsProcessing(false);
            return; // Stop here if validation fails
        }


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
        <div className="space-y-6">
            <h3 className="text-xl font-medium text-foreground mb-4">Complete Payment</h3>
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}

            <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full"
                >
                    Voltar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!stripe || isProcessing}
                    className="w-full"
                >
                    {isProcessing ? 'A Processar...' : 'Finalizar Compra'}
                </Button>
            </div>
        </div>
    );
}

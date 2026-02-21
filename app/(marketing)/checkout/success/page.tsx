import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const paymentIntent = searchParams.payment_intent as string | undefined;
    const setupIntent = searchParams.setup_intent as string | undefined;
    const redirectStatus = searchParams.redirect_status as string | undefined;

    // Check if it was successful (succeeded) or requires action
    const isSuccess = redirectStatus === 'succeeded';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                {isSuccess ? (
                    <>
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
                        <p className="text-gray-600">
                            Thank you for your purchase. Your workspace is currently being provisioned.
                            You will receive an email shortly with access instructions.
                        </p>
                        {setupIntent && !paymentIntent && (
                            <p className="text-sm text-gray-500 mt-2">
                                Your payment method was successfully saved for your trial/subscription.
                            </p>
                        )}
                        <div className="pt-6">
                            <Link href="/">
                                <Button className="w-full">Return Hub</Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Status: {redirectStatus || 'Unknown'}</h1>
                        <p className="text-gray-600">
                            Your payment may be processing or an action might be required.
                            Please check your email for further instructions.
                        </p>
                        <div className="pt-6">
                            <Link href="/checkout">
                                <Button variant="outline" className="w-full">Back to Checkout</Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

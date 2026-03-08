"use client";

import { useState } from "react";
import { getLoginUrlByEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await getLoginUrlByEmail(formData);

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else if (result?.redirectUrl) {
                window.location.href = result.redirectUrl;
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="name@company.com"
                        className="appearance-none block w-full"
                    />
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div>
                <Button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Continue"}
                </Button>
            </div>
        </form>
    );
}

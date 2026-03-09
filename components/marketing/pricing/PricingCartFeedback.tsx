"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export function PricingCartFeedback() {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        const added = searchParams.get("added");

        if (added === "sensor") {
            // Clean up the URL first
            window.history.replaceState(null, "", pathname);

            // Fire the Sonner toast
            toast.success("Sensor adicionado no carrinho!", {
                id: "sensor-added",
                description: "Por favor selecione um plano para continuar a sua instalação.",
                duration: 4000,
                position: "bottom-center"
            });
        }
    }, [searchParams, pathname]);

    return null;
}

export default PricingCartFeedback;

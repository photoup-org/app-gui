"use client";

import { useEffect, useRef } from "react";
import { useMqttStore } from "@/hooks/useMqttStore";
import { toast } from "sonner";
import { AlertCircle, TriangleAlert, Info } from "lucide-react";

export function AlertNotifier() {
  const liveAlerts = useMqttStore((state) => state.liveAlerts);
  
  // Track which alerts we've already displayed a toast for
  const processedAlerts = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!liveAlerts || liveAlerts.length === 0) return;

    // Check the most recent incoming alerts (in case multiple arrive at once)
    const newestAlerts = liveAlerts.slice(0, 5);

    newestAlerts.forEach((alert) => {
      // Use the ID provided by the backend, fallback to a composite key
      const alertId = alert.id || `${alert.timestamp}-${alert.message}`;

      if (!processedAlerts.current.has(alertId)) {
        processedAlerts.current.add(alertId);

        // --- FUTURE FEATURE PLACEHOLDERS ---
        
        // 1. Browser/OS Notifications (Requires requesting permissions first)
        // if (typeof window !== "undefined" && "Notification" in window) {
        //   if (Notification.permission === "granted") {
        //     new Notification(`IoT Alert: ${alert.level}`, {
        //       body: alert.message,
        //       icon: "/icon.png" // Placeholder for an app icon
        //     });
        //   }
        // }

        // 2. Email Triggers (If not already handled server-side via Edge Worker)
        // triggerEmailNotification(alert);
        
        // -----------------------------------

        // Render the in-app Toast
        if (alert.level === "CRITICAL") {
          toast.error("Alerta Crítico", {
            description: alert.message,
            icon: <AlertCircle className="w-4 h-4 text-red-500" />,
            duration: 10000,
          });
        } else if (alert.level === "ERROR" || alert.level === "WARN") {
          toast.warning("Aviso de Sistema", {
            description: alert.message,
            icon: <TriangleAlert className="w-4 h-4 text-amber-500" />,
            duration: 8000,
          });
        } else {
          toast.info("Informação", {
            description: alert.message,
            icon: <Info className="w-4 h-4 text-blue-500" />,
            duration: 5000,
          });
        }
      }
    });
  }, [liveAlerts]);

  return null; // This is a logic-only component, it doesn't render any DOM elements itself
}

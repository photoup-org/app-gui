import { Router, Droplets, Thermometer, Gauge, Zap, Waves, Wind, Activity, Box, LucideIcon } from "lucide-react";

export interface DeviceUIProps {
    icon: LucideIcon;
    textColor: string;
    bgColor: string;
    label: string;
}

/**
 * Maps hardware device types (or names) to their specific UI properties.
 * Handles both English and Portuguese names/types.
 * 
 * @param deviceType The name or type of the device to retrieve properties for.
 * @returns An object containing the icon, tailwind text color, tailwind background color, and a formatted label.
 */
export function getDeviceUI(deviceType: string): DeviceUIProps {
    const normalizedType = (deviceType || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    switch (true) {
        case normalizedType.includes("ph"):
            return {
                icon: Droplets,
                textColor: "text-disp-ph",
                bgColor: "bg-disp-ph-bg",
                label: "Sensor de pH",
            };
        case normalizedType.includes("temp"):
            return {
                icon: Thermometer,
                textColor: "text-destructive",
                bgColor: "bg-destructive/10",
                label: "Sensor de Temperatura",
            };
        case normalizedType.includes("amp") || normalizedType.includes("pinca"):
            return {
                icon: Zap,
                textColor: "text-warning",
                bgColor: "bg-warning/10",
                label: "Pinça Amperimétrica",
            };
        case normalizedType.includes("salin"):
            return {
                icon: Waves,
                textColor: "text-disp-salinity",
                bgColor: "bg-disp-salinity/10",
                label: "Sensor de Salinidade",
            };
        case normalizedType.includes("biogas"):
            return {
                icon: Wind,
                textColor: "text-info",
                bgColor: "bg-info/10",
                label: "Sensor de Biogás",
            };
        case normalizedType.includes("vibr"):
            return {
                icon: Activity,
                textColor: "text-disp-gateway",
                bgColor: "bg-disp-gateway/10",
                label: "Sensor de Vibração",
            };
        default:
            return {
                icon: Box,
                textColor: "text-slate-500",
                bgColor: "bg-slate-100",
                label: deviceType || "Dispositivo Desconhecido",
            };
    }
}

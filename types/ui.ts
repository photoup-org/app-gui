import { LucideIcon } from "lucide-react";

export interface GatewayFeature {
    id: string;
    title: string;
    description: string;
    position: {
        x: number;
        y: number;
    };
    icon?: React.ReactNode;
}

export interface HotspotData {
    id: string;
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
    title: string;
    description: string;
    icon?: LucideIcon;
}

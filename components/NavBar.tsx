"use client";

import React, { useState, useEffect, useRef } from "react";
import { Home, Search, Heart, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { name: "Home", icon: Home },
    { name: "Search", icon: Search },
    { name: "Likes", icon: Heart },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: User },
];

export function NavBar() {
    const [active, setActive] = useState(3);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // Update indicator and container width on resize/active change
    useEffect(() => {
        const updatePosition = () => {
            const activeTab = tabsRef.current[active];
            if (activeTab && containerRef.current) {
                const { offsetLeft, offsetWidth } = activeTab;
                setContainerWidth(containerRef.current.offsetWidth);
                setIndicatorStyle({
                    left: offsetLeft,
                    width: offsetWidth,
                });
            }
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        return () => window.removeEventListener("resize", updatePosition);
    }, [active]);

    // Path generation
    // Path generation
    const getPath = () => {
        const height = 80; // Height of bar
        const width = containerWidth || 380; // Default fallback
        const radius = 40; // Corner radius of the bar (pill shape)
        const center = indicatorStyle.left + indicatorStyle.width / 2;

        // Notch parameters
        const notchRadius = 24; // Radius of the curved cutout
        const cornerRadius = 16; // Radius of the top smoothing corner

        // If we haven't measured yet, return a simple pill
        if (indicatorStyle.width === 0) return `M ${radius},0 L ${width - radius},0 A ${radius},${radius} 0 0 1 ${width},${radius} L ${width},${height - radius} A ${radius},${radius} 0 0 1 ${width - radius},${height} L ${radius},${height} A ${radius},${radius} 0 0 1 0,${height - radius} L 0,${radius} A ${radius},${radius} 0 0 1 ${radius},0 Z`;

        // Coordinates
        const p1 = center - notchRadius - cornerRadius; // Start of curve
        const p2 = center - notchRadius; // Control point 1 / connection to notch
        const p3 = center; // Bottom of notch
        const p4 = center + notchRadius; // Other side of notch
        const p5 = center + notchRadius + cornerRadius; // End of curve

        // Safety check to ensure we don't draw backwards if padding is too small relative to border radius
        const startX = Math.max(p1, radius);

        // SVG Path for the Bar with a Notch
        return `
      M ${radius},0
      L ${startX},0
      Q ${p2},0 ${p2},${notchRadius / 2}
      A ${notchRadius},${notchRadius} 0 0 0 ${p4},${notchRadius / 2}
      Q ${p4},0 ${p5},0
      L ${width - radius},0
      A ${radius},${radius} 0 0 1 ${width},${radius}
      L ${width},${height - radius}
      A ${radius},${radius} 0 0 1 ${width - radius},${height}
      L ${radius},${height}
      A ${radius},${radius} 0 0 1 0,${height - radius}
      L 0,${radius}
      A ${radius},${radius} 0 0 1 ${radius},0
      Z
    `;
    };

    return (
        <div className="flex justify-center w-full p-4">
            <div
                ref={containerRef}
                className="relative flex items-center h-20 w-fit min-w-[380px]"
            >
                {/* SVG Background with Shadow */}
                <div className="absolute inset-0 w-full h-full drop-shadow-xl z-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox={`0 0 ${containerWidth || 380} 80`} preserveAspectRatio="none">
                        <path
                            d={getPath()}
                            className="fill-white dark:fill-zinc-900 transition-[d] duration-300 ease-in-out"
                        />
                    </svg>
                </div>

                {/* Floating Dot */}
                <div
                    className="absolute z-50 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-300 ease-in-out"
                    style={{
                        left: indicatorStyle.left + indicatorStyle.width / 2,
                        top: "22px", // Positioned inside the notch
                        transform: "translateX(-50%)",
                    }}
                />

                {/* Items */}
                <div className="relative z-10 flex w-full justify-between items-center px-12">
                    {items.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = active === index;

                        return (
                            <button
                                key={item.name}
                                ref={(el) => { tabsRef.current[index] = el; }}
                                onClick={() => setActive(index)}
                                className="flex flex-col items-center justify-center w-16 h-16 rounded-full focus:outline-none group relative"
                            >
                                <div
                                    className={cn(
                                        "transition-all duration-300 transform relative z-20",
                                        isActive ? "translate-y-2 opacity-0 scale-50" : "opacity-100 scale-100"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            "text-gray-900 dark:text-gray-400"
                                        )}
                                        strokeWidth={2}
                                    />
                                </div>

                                <span
                                    className={cn(
                                        "absolute top-8 text-xs font-bold transition-all duration-300",
                                        isActive
                                            ? "opacity-100 translate-y-0 text-blue-600"
                                            : "opacity-0 translate-y-2"
                                    )}
                                >
                                    {item.name}
                                </span>

                                {/* Optional: Add a subtle 'light' effect or ripple if desired? No, stick to clean. */}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

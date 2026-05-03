"use client";

import { setLabProfile } from "@/actions/onboarding";
import { LabProfile } from "@prisma/client";
import { useState } from "react";

export function WelcomeScreen() {
    const [isPending, setIsPending] = useState(false);

    const handleSelect = async (profile: LabProfile) => {
        setIsPending(true);
        try {
            await setLabProfile(profile);
        } catch (error) {
            console.error("Failed to set lab profile:", error);
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to your Lab</h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                    To get started, please tell us how you plan to use the IoT Monitor. 
                    This will help us tailor your dashboard experience.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                <button
                    onClick={() => handleSelect("CONTINUOUS")}
                    disabled={isPending}
                    className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group"
                >
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Monitoring</h3>
                    <p className="text-gray-500">Real-time data streaming for long-term experiments and infrastructure.</p>
                </button>

                <button
                    onClick={() => handleSelect("PROJECTS")}
                    disabled={isPending}
                    className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group"
                >
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Project-Based</h3>
                    <p className="text-gray-500">Organize your data into specific campaigns, tests, or time-bound projects.</p>
                </button>
            </div>

            {isPending && (
                <div className="flex items-center space-x-2 text-blue-600 animate-pulse">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-medium">Setting up your workspace...</span>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Role, LabProfile } from "@prisma/client";

/**
 * AppState represents the lean user and workspace context
 * used for client-side UI state and authorization checks.
 */
export interface AppState {
    user: {
        id: string;
        name: string | null;
        email: string;
        picture: string | null;
    };
    workspace: {
        departmentId: string;
        organizationName: string;
        departmentName: string;
        role: Role;
        planName: string | null;
        labProfile: LabProfile | null;
    };
}

interface AppContextType {
    state: AppState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider provides the initial server-fetched context to the client component tree.
 */
export function AppProvider({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState: AppState;
}) {
    return (
        <AppContext.Provider value={{ state: initialState }}>
            {children}
        </AppContext.Provider>
    );
}

/**
 * Hook to access the unified app context.
 */
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}

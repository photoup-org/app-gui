'use client';

import React, { createContext, useContext } from 'react';

// Define the UserProfile interface to match Auth0 user data structure
export interface UserProfile {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    updated_at?: string;
    org_id?: string;
    org_name?: string;
    roles?: string[];
    [key: string]: unknown; // For custom claims like roles
}

interface UserContextType {
    user: UserProfile | undefined | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
    user: undefined,
    isLoading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({
    user,
    children,
}: {
    user: UserProfile | undefined | null;
    children: React.ReactNode;
}) => {
    return (
        <UserContext.Provider value={{ user, isLoading: false }}>
            {children}
        </UserContext.Provider>
    );
};

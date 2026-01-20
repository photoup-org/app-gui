import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
    // This hook is REQUIRED in v4 to persist custom claims
    async beforeSessionSaved(session, idToken) {
        //this needs to be here to persist the roles claim
        return session;
    }
});
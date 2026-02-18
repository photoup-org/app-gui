const getBaseUrl = () => {
    const domain = process.env.AUTH0_DOMAIN;
    if (!domain) return '';
    // Ensure protocol
    return domain.startsWith('http') ? domain : `https://${domain}`;
};

async function getManagementToken(): Promise<string> {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;
    if (!domain || !clientId || !clientSecret) {
        throw new Error(
            'Missing Auth0 M2M credentials. Please check AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, and AUTH0_M2M_CLIENT_SECRET in .env.local'
        );
    }

    const response = await fetch(`${getBaseUrl()}/oauth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            audience: `${getBaseUrl()}/api/v2/`,
            grant_type: 'client_credentials',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get M2M token: ${error.error_description || error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function checkOrgExists(slug: string): Promise<boolean> {
    const token = await getManagementToken();
    // Use the direct endpoint to get organization by name (slug)
    const url = `${getBaseUrl()}/api/v2/organizations/name/${encodeURIComponent(slug)}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return true;
    }

    if (response.status === 404) {
        return false;
    }

    throw new Error(`Failed to check organization: ${response.status} ${response.statusText}`);
}

export async function createOrg(slug: string, displayName: string, metadata?: any) {
    const token = await getManagementToken();
    const response = await fetch(`${getBaseUrl()}/api/v2/organizations`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: slug,
            display_name: displayName,
            metadata
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        // 409 Conflict
        if (response.status === 409) {
            throw new Error(`Organization with this name already exists.`);
        }
        throw new Error(`Failed to create organization: ${error.message || response.statusText}`);
    }

    return await response.json();
}

export async function inviteAdminToOrg(orgId: string, email: string) {
    const token = await getManagementToken();

    const clientId = process.env.AUTH0_CLIENT_ID;
    if (!clientId) {
        throw new Error('AUTH0_CLIENT_ID is not defined. It is required to generate the invitation link.');
    }

    const response = await fetch(`${getBaseUrl()}/api/v2/organizations/${orgId}/invitations`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            invitee: { email },
            inviter: { name: 'System Admin' },
            client_id: clientId
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to invite user: ${error.message || response.statusText}`);
    }

    return await response.json();
}

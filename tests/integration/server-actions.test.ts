import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAppSession } from '@/lib/session';

// Mock the session module
vi.mock('@/lib/session', () => ({
    getAppSession: vi.fn(),
}));

// Dummy Server Action to test
async function dummyProtectedAction(targetOrgId: string) {
    const session = await getAppSession(); // In a real Server Action, we pass `request` or rely on Next.js headers

    if (!session) {
        throw new Error('Unauthorized');
    }

    if (session.user.org_id !== targetOrgId) {
        throw new Error('Forbidden: Wrong Organization');
    }

    return { success: true, data: 'Protected Record' };
}

describe('Server Actions Authorization Boundaries', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Scenario A: Unauthorized API Call throws Error', async () => {
        // Mock getAppSession to return null (unauthenticated)
        vi.mocked(getAppSession).mockResolvedValue(null);

        await expect(dummyProtectedAction('org_XYZ')).rejects.toThrowError('Unauthorized');
    });

    it('Scenario B: Authorized but Wrong Org throws Forbidden', async () => {
        // Mock getAppSession to return a user with a different org_id
        vi.mocked(getAppSession).mockResolvedValue({
            user: {
                sub: 'auth0|123',
                org_id: 'org_ABC', // User is in org_ABC
            }
        } as any);

        // Target data belongs to org_XYZ
        await expect(dummyProtectedAction('org_XYZ')).rejects.toThrowError('Forbidden: Wrong Organization');
    });

    it('Scenario C: Fully Authorized returns data successfully', async () => {
        // Mock getAppSession to return a user with matching org_id
        vi.mocked(getAppSession).mockResolvedValue({
            user: {
                sub: 'auth0|123',
                org_id: 'org_XYZ', // User is in org_XYZ
            }
        } as any);

        const result = await dummyProtectedAction('org_XYZ');
        expect(result).toEqual({ success: true, data: 'Protected Record' });
    });
});

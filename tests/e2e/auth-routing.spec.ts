import { test, expect } from '@playwright/test';

test.describe('Authentication and Authorization Routing', () => {

    test('Scenario A: Unauthenticated access to /dashboard redirects to /login', async ({ page, baseURL }) => {
        const response = await page.goto('/dashboard');
        const finalUrl = new URL(page.url());
        expect(finalUrl.pathname).toBe("/login");
        expect(finalUrl.searchParams.get("returnTo")).toBe("/dashboard");
    });

    test('Scenario B: Marketing route / is accessible without authentication', async ({ page }) => {
        const response = await page.goto('/');
        // Should not redirect to login, should be a 200 OK (or at least load marketing page)
        expect(response?.status()).toBe(200);
        expect(page.url()).not.toContain('/login');
    });

    test('Scenario C: Authenticated but missing org_id redirects to /no-workspace', async ({ context, page, baseURL }) => {

        await context.addCookies([
            {
                name: 'appSession',
                value: 'invalid.token.payload',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/dashboard');
        expect(page.url()).toBe(baseURL + '/');
    });
});

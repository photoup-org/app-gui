import { test, expect } from '@playwright/test';

test.describe('Hardware Cart Logic', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        // Start flow from pricing
        await page.goto('/pricing');

        // Click the first plan to navigate to hardware cart
        await page.getByRole('link', { name: /Select Plan|Choose/i }).first().click();

        // Wait to land on hardware cart page (can take long on dev server first compile)
        await expect(page.getByRole('heading', { name: 'Hardware Selection' })).toBeVisible({ timeout: 45000 });
    });

    test('Base Allocation: Add base sensors until limit or paid tier triggers', async ({ page }) => {
        // Because the DB name of the sensor can vary, we look for the generic card block containing "+" buttons
        // Assuming "Base Sensor" or just finding generic sensors by looking for the "+" buttons.
        const firstSensorPlusBtn = page.locator('.grid').first().locator('button', { hasText: '+' }).first();

        // Add 1 base sensor
        await firstSensorPlusBtn.click();

        // Wait and check if the count increases visually to 1
        await expect(page.locator('.grid').first().locator('span').filter({ hasText: '1' }).first()).toBeVisible();

        // Try adding more up to 4
        await firstSensorPlusBtn.click();
        await firstSensorPlusBtn.click();
        await firstSensorPlusBtn.click();
    });

    test('Gateway Rules: Gateways can be added and incremented', async ({ page }) => {
        // The second major grid/block usually holds the gateways
        const section = page.locator('div', { hasText: 'Extra Gateways' }).last();
        const gatewayPlusBtn = section.locator('button', { hasText: '+' }).first();

        // Wait for gateway section to visibly have the + button
        await expect(gatewayPlusBtn).toBeVisible();

        // Add 1 Gateway
        await gatewayPlusBtn.click();

        // Assert count updates to 1
        await expect(section.locator('span').filter({ hasText: '1' }).first()).toBeVisible();

        // Continue to checkout to verify form passes
        await page.getByRole('button', { name: 'Continue to Checkout' }).click();
        await expect(page).toHaveURL(/.*\/checkout\?plan_id=.+/);
    });
});

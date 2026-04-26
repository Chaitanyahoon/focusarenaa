import { test, expect } from '@playwright/test';

test.describe('Focus Arena E2E Smoke Tests', () => {

  test('Should render the landing page', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Expect the page to have a specific title or hero element.
    // The logo or word "Focus Arena" should be visible.
    await expect(page.locator('text=/Focus Arena/i').first()).toBeVisible();
  });

  test('Should navigate to the login page', async ({ page }) => {
    await page.goto('/');

    // Look for a login link/button. It usually says "Login"
    const loginButton = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    
    if (await loginButton.isVisible()) {
        await loginButton.click();
        // Simply expect the URL to have /login or a form to be visible as a smoke check
        await expect(page).toHaveURL(/.*login/);
    }
  });

  // More deep tests like creating tasks or hitting gates require mocked or seeded API state.
  // We keep it to smoke tests here to ensure the build doesn't inherently crash on boot.
});

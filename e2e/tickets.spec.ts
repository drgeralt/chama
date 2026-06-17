import { test, expect } from '@playwright/test';

test.describe('Tickets Flow', () => {
  test('should login and view tickets', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials
    // Note: Em ambiente real os dados viriam de fixtures geradas no DB
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'nochama');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify tickets load
    await expect(page.locator('text=Fila do Departamento')).toBeVisible();
    
    // Test WebSocket or UI responsiveness
    // A ticket should be visible (mocked or pre-seeded)
    // await expect(page.locator('.ticket-card').first()).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Critical Customer Journey: Home -> Products Smoke', () => {
  test('navigates from homepage to products catalog successfully', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');

    // Assert page has loaded and title is populated
    await expect(page).toHaveTitle(/حوا للتوزيع|Hawa Distribution/i);

    // Assert main header or logo is present
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 2. Navigate to /products
    // Try to find products link in navigation or navigate directly
    const productsLink = page.locator('a[href="/products"]').first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
    } else {
      await page.goto('/products');
    }

    // 3. Verify on /products page
    await expect(page).toHaveURL(/\/products/);

    // Verify main catalog elements are present and no server error
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Application error: a server-side exception has occurred');
    expect(pageContent).not.toContain('Internal Server Error');

    // Verify catalog title or main container exists
    const catalogContainer = page.locator('main, [role="main"], #catalog-filter-title, h1').first();
    await expect(catalogContainer).toBeVisible();
  });
});

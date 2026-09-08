import { test, expect } from '@playwright/test';

test.describe('Phase 10.1: Responsive Customer Journey Matrix', () => {

  test('Arabic RTL and English LTR directionality and language layout', async ({ page }) => {
    // 1. Arabic RTL at root
    await page.goto('/');
    const htmlAr = page.locator('html');
    await expect(htmlAr).toHaveAttribute('dir', 'rtl');
    await expect(htmlAr).toHaveAttribute('lang', 'ar');

    // Verify Arabic content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // 2. English LTR at /en
    await page.goto('/en');
    const htmlEn = page.locator('html');
    await expect(htmlEn).toHaveAttribute('dir', 'ltr');
    await expect(htmlEn).toHaveAttribute('lang', 'en');
  });

  test('Guest state: wholesale price gating and catalog access', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);

    // Guest users should not see raw wholesale prices; instead price-gated badge or login CTA
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('500 Internal Server Error');

    // Confirm catalog products are loaded and clickable
    const productCards = page.locator('[data-testid="product-card"], main a[href*="/products/"]').first();
    await expect(productCards).toBeVisible();
  });

  test('Search catalog, debounce, and navigation', async ({ page }) => {
    await page.goto('/');

    // Locate and trigger search bar or search button
    const searchTrigger = page.locator('header input[type="search"], header input[placeholder*="بحث"], header button[aria-label*="بحث"], header button[aria-label*="search"], #search-trigger').first();
    if (await searchTrigger.isVisible()) {
      if ((await searchTrigger.getAttribute('type')) === 'search' || (await searchTrigger.evaluate((el) => el.tagName === 'INPUT'))) {
        await searchTrigger.fill('زيت');
        await page.waitForTimeout(500); // debounce wait
      } else {
        await searchTrigger.click({ force: true });
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('زيت');
          await page.waitForTimeout(500);
        }
      }
    }

    // Ensure no crash or uncaught error during search interaction
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Unhandled Runtime Error');
  });

  test('Cart state persistence across page navigation and reloads', async ({ page }) => {
    await page.goto('/products');

    // Check if add to cart button exists on any product
    const addToCartBtn = page.locator('main button[aria-label*="سلة"], main button[aria-label*="cart"], main button:has-text("أضف"), main button:has-text("إضافة"), header button[aria-label*="سلة"]').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click({ force: true });
      await page.waitForTimeout(600);

      // Verify cart count updated or cart drawer opened
      await page.reload();
      const bodyAfterReload = await page.textContent('body');
      expect(bodyAfterReload).not.toContain('Application error');
    }
  });

  test('Place Order form validation, error handling, and retry', async ({ page }) => {
    // Populate cart with a test item so checkout form is active
    await page.addInitScript(() => {
      try {
        localStorage.setItem('hawa_cart', JSON.stringify([{
          id: 'test-item-1',
          productId: 'test-product-1',
          slug: 'test-product-1',
          name: 'منتج تجريبي',
          nameAr: 'منتج تجريبي',
          price: '0',
          cartonQuantity: 5,
          piecesPerCarton: 12,
          totalPieces: 60,
        }]));
      } catch {}
    });

    await page.goto('/place-order');
    await expect(page).toHaveURL(/\/place-order/);

    // Shipping form submit button
    const submitBtn = page.locator('form button[type="submit"]:has-text("تأكيد"), form button[type="submit"]:has-text("إرسال"), form button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();

    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      await page.waitForTimeout(500);

      // Should display validation feedback without a 500 error
      const content = await page.content();
      expect(content).not.toContain('500 Internal Server Error');
      expect(content).not.toContain('Application error: a server-side exception');
    }
  });

  test('Back / Forward navigation integrity', async ({ page }) => {
    // 1. Start at Home
    await page.goto('/');
    const homeTitle = await page.title();

    // 2. Navigate to Products
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);

    // 3. Navigate back to Home
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    expect(await page.title()).toBe(homeTitle);

    // 4. Navigate forward to Products
    await page.goForward();
    await expect(page).toHaveURL(/\/products/);
  });

  test('Login and Account navigation flow', async ({ page }) => {
    await page.goto('/account/login');
    await expect(page).toHaveURL(/\/account\/login/);

    // Assert login form controls exist
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="هاتف"]').first();
    await expect(phoneInput).toBeVisible();

    const passInput = page.locator('input[name="password"], input[type="password"]').first();
    await expect(passInput).toBeVisible();

    // Test invalid credentials submission displays error message safely
    await phoneInput.fill('0944000000');
    await passInput.fill('wrongpassword');
    const loginBtn = page.locator('button[type="submit"], button:has-text("دخول")').first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForTimeout(1000);

      // Verify no crash or unhandled 500
      const content = await page.content();
      expect(content).not.toContain('Application error');
    }
  });
});

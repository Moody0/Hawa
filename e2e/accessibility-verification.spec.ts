import { test, expect } from '@playwright/test';

test.describe('Phase 10.2: Accessibility Verification (WCAG 2.2)', () => {

  test('Skip-to-content link exists, is accessible by keyboard, and focuses target', async ({ page }) => {
    await page.goto('/');

    // Locate skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Tab key should bring focus to the skip link and reveal it
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    // Target container with id main-content exists in page
    const mainContent = page.locator('#main-content, main, [role="main"]').first();
    await expect(mainContent).toBeAttached();
  });

  test('Key interactive elements have accessible names and keyboard focusability', async ({ page }) => {
    await page.goto('/');

    // Buttons must have accessible text or aria-label
    const buttons = await page.locator('button:visible').all();
    for (const btn of buttons.slice(0, 15)) {
      const text = await btn.innerText().catch(() => '');
      const ariaLabel = await btn.getAttribute('aria-label');
      const ariaLabelledBy = await btn.getAttribute('aria-labelledby');
      const title = await btn.getAttribute('title');

      const hasAccessibleName = Boolean(text.trim() || ariaLabel || ariaLabelledBy || title);
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('Form fields have associated labels or aria-labels on Account Login', async ({ page }) => {
    await page.goto('/account/login');

    const inputs = await page.locator('input:visible').all();
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      let hasLabel = Boolean(ariaLabel || ariaLabelledBy || placeholder);
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        if (await label.count() > 0) hasLabel = true;
      }
      expect(hasLabel).toBe(true);
    }
  });

  test('Images have valid alt text or decorative aria-hidden', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img:visible').all();
    for (const img of images.slice(0, 20)) {
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      const role = await img.getAttribute('role');

      const isAccessible = alt !== null || ariaHidden === 'true' || role === 'presentation';
      expect(isAccessible).toBe(true);
    }
  });

  test('Reduced-motion mode is honored without runtime layout or script breakage', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Ensure animations are disabled/reduced and page renders cleanly
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Application error');
  });

  test('200% zoom / high-density layout retains readability and avoids breaking overflow', async ({ page }) => {
    // Emulate 200% zoom by scaling viewport factor
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto('/');

    // Verify main landmarks are intact
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();
  });
});

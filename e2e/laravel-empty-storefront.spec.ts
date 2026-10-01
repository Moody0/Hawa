import { expect, test } from '@playwright/test';

test('empty Laravel catalog and public pages render without application errors', async ({ page, request }) => {
    const catalog = await request.get('/api/products');
    expect(catalog.ok()).toBeTruthy();
    expect((await catalog.json()).pagination.total).toBe(0);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/products', '/about-us', '/contact', '/brands', '/account/login', '/admin/login']) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await expect(page.locator('body')).not.toBeEmpty();
        if (route === '/') {
            await expect(page.locator('a[href^="/products/"]')).toHaveCount(0);
            await expect(page.getByRole('tablist', { name: 'تشكيلات المنتجات' })).toHaveCount(0);
            await expect(page.getByText('سوبرماركت الشام الحديث (دمشق - كفرسوسة)', { exact: true })).toHaveCount(0);
            await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(1);
        }
    }
    expect(errors).toEqual([]);
});

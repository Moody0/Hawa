# Import the Hawa product workbook

Source: `منتجات شركة حوا.xlsx`, first worksheet, rows 2–143.

The reviewed JSON is `backend/database/imports/hawa-products.json`. It contains 142 products, two main categories, seven trimmed brand names and 16 distinct subcategory names. Product images have been converted to WebP (`/uploads/products/{barcode}.webp`) from high-resolution source images, achieving ~88.5% size optimization.

All prices and stored stock quantities are zero. These products support quotation inquiries: they remain visible, can be added to an inquiry, and do not reserve inventory. Prices and availability are confirmed through WhatsApp. Guests see masked pricing; signed-in customers see “Price on Inquiry”. Changing a product to a positive visible price enables normal inventory checks.

The 136 available product images have been converted to WebP and mapped to product barcodes 1–142 in `public/uploads/products/` and `backend/storage/app/public/products/`. Six products without image URLs use `/placeholder.svg` (barcodes 18, 98, 99, 108, 134, and 142). Every imported field remains editable in the admin dashboard.

## VPS import

Run this exact block as root on the VPS after running `git pull origin main`:

```bash
# 1. Update backend and import the new product catalog with local WebP images
su - deploy -c 'cd /var/www/hawa/current/backend && php artisan migrate --force && php artisan hawa:import-catalog --force --dry-run && php artisan hawa:import-catalog --force'

# 2. Rebuild Next.js frontend (to serve the new public/uploads/products WebP images) and restart PM2
su - deploy -c 'cd /var/www/hawa/current && npm run build && pm2 reload all'
```

The dry run validates every product and rolls back its changes. The `--force` flag updates existing products in place (matching by barcode/SKU or name) without breaking existing order histories. Running this command again makes no changes unless forced.

## Check the result

1. Open `/admin/products`: there should be 142 products.
2. Check `/admin/brands`: there should be seven brands.
3. Open `/products` as a guest: products should appear with masked pricing.
4. Sign in, open a product, and add it to an inquiry. Zero stored quantity should not disable its controls.
5. Submit an inquiry and use “Ask for prices on WhatsApp”. The message contains product names and requested quantities without a zero-dollar quotation.
6. Set the business WhatsApp number through Site Content → General Contact Data if it is not already configured.

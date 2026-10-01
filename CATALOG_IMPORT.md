# Import the Hawa product workbook

Source: `منتجات شركة حوا.xlsx`, first worksheet, rows 2–143.

The reviewed JSON is `backend/database/imports/hawa-products.json`. It contains 142 products, two main categories, seven trimmed brand names and 16 distinct subcategory names. Subcategory records are associated with their brands, so the number of records may exceed the number of distinct names.

All prices and stored stock quantities are zero. These products support quotation inquiries: they remain visible, can be added to an inquiry, and do not reserve inventory. Prices and availability are confirmed through WhatsApp. Guests see masked pricing; signed-in customers see “Price on Inquiry”. Changing a product to a positive visible price enables normal inventory checks.

The original workbook is unchanged. Names, descriptions, category assignments and 136 image URLs are preserved. Six products without image URLs use `/placeholder.svg`. Their Excel row numbers are 19, 99, 100, 109, 135 and 143. Every imported field remains editable in the admin dashboard.

## VPS import

First deploy the updated package using `VPS_DEPLOYMENT.md`. It includes the quote flow changes and migration. Do not import into the previous application release, whose stock filter hides products with zero quantity.

Run this exact block as root on the VPS after updating:

```bash
su - deploy -c 'cd /var/www/hawa/current/backend && php artisan migrate --force && php artisan hawa:import-catalog --dry-run && php artisan hawa:import-catalog'
```

The dry run validates every product and rolls back its changes. The actual import is transactional. Running this command again with the identical JSON file makes no changes. It refuses to import a new file if the catalog already contains products, protecting existing administrator edits. It requires an active super administrator, which must already have been created during deployment.

## Check the result

1. Open `/admin/products`: there should be 142 products.
2. Check `/admin/brands`: there should be seven brands.
3. Open `/products` as a guest: products should appear with masked pricing.
4. Sign in, open a product, and add it to an inquiry. Zero stored quantity should not disable its controls.
5. Submit an inquiry and use “Ask for prices on WhatsApp”. The message contains product names and requested quantities without a zero-dollar quotation.
6. Set the business WhatsApp number through Site Content → General Contact Data if it is not already configured.

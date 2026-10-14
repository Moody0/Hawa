const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = 'C:/Users/moham/Downloads/منتجات شركة حوا.xlsx';
const targetDir = path.join(__dirname, '../public/uploads/products');

const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets['الورقة1'];
const rawRows = xlsx.utils.sheet_to_json(sheet);

console.log(`Read ${rawRows.length} rows from Excel`);

const processedRows = rawRows.map((r, idx) => {
    const barcode = r['الباركود'] !== undefined && r['الباركود'] !== null ? String(r['الباركود']).trim() : String(idx + 1);
    const webpFilename = `${barcode}.webp`;
    const webpExists = fs.existsSync(path.join(targetDir, webpFilename));

    const imagePath = webpExists ? `/uploads/products/${webpFilename}` : '/placeholder.svg';

    return {
        'Main Category': (r['القسم الرئيسي'] || '').trim(),
        'Sub Category': (r['القسم الفرعي'] || '').trim(),
        'Brand Name': (r['اسم الماركة'] || '').trim(),
        'Name ar': (r['اسم المنتج بالعربي'] || '').trim(),
        'Name en': (r['اسم المنتج بالإنجليزي'] || '').trim(),
        'description ar': (r['وصف المنتج بالعربي'] || '').trim() || (r['اسم المنتج بالعربي'] || '').trim(),
        'description en': (r['وصف المنتج بالإنجليزي'] || '').trim() || (r['اسم المنتج بالإنجليزي'] || '').trim(),
        'Price': typeof r['السعر'] === 'number' ? r['السعر'] : (parseFloat(r['السعر']) || 0),
        'Quantity': typeof r['الكمية'] === 'number' ? r['الكمية'] : (parseInt(r['الكمية'], 10) || 0),
        'Options': r['الخيارات'] ? String(r['الخيارات']).trim() : '',
        'SKU': barcode,
        'Barcode': barcode,
        'Images': imagePath,
        'Packaging': 'طرد',
        'Min Order': 1
    };
});

const output = {
    productCount: processedRows.length,
    rows: processedRows
};

const withImage = processedRows.filter(r => r.Images !== '/placeholder.svg').length;
const withPlaceholder = processedRows.filter(r => r.Images === '/placeholder.svg').length;

console.log(`Total products: ${processedRows.length}`);
console.log(`With WebP images: ${withImage}`);
console.log(`With placeholder: ${withPlaceholder}`);

const outputPath = path.join(__dirname, '../backend/database/imports/hawa-products.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Saved updated catalog to ${outputPath}`);

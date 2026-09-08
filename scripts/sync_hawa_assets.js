const fs = require('fs');
const path = require('path');

// 1. Ensure target directories exist
const brandTargetDir = path.join(__dirname, '../public/images/brands');
const catTargetDir = path.join(__dirname, '../public/images/categories');
const uploadsBrandsDir = path.join(__dirname, '../public/uploads/brands');

fs.mkdirSync(brandTargetDir, { recursive: true });
fs.mkdirSync(catTargetDir, { recursive: true });
fs.mkdirSync(uploadsBrandsDir, { recursive: true });

// 2. Copy brand logos from C:\Users\moham\Downloads\hawa
const brandSourceDir = 'C:\\Users\\moham\\Downloads\\hawa';
const brandFiles = fs.readdirSync(brandSourceDir);
console.log('Copying brand files:', brandFiles);

const brandMap = {};
for (const file of brandFiles) {
    const src = path.join(brandSourceDir, file);
    const dest = path.join(brandTargetDir, file.toLowerCase());
    fs.copyFileSync(src, dest);
    // Also copy to uploadsBrandsDir
    fs.copyFileSync(src, path.join(uploadsBrandsDir, file.toLowerCase()));
    console.log(`Copied ${file} -> /images/brands/${file.toLowerCase()}`);
    brandMap[file.replace(/\.webp$/i, '').toLowerCase()] = `/images/brands/${file.toLowerCase()}`;
}

// 3. Copy category images from C:\Users\moham\Downloads\hawa categories
const catSourceDir = 'C:\\Users\\moham\\Downloads\\hawa categories';
const catFiles = fs.readdirSync(catSourceDir);
console.log('\nCopying category files:', catFiles);

for (const file of catFiles) {
    const src = path.join(catSourceDir, file);
    // Standard filename (e.g. dishwashing-liquid.webp)
    const normalizedName = file
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    // Copy original name
    fs.copyFileSync(src, path.join(catTargetDir, file));
    // Copy normalized name if different
    if (normalizedName && !normalizedName.endsWith('.webp')) {
        fs.copyFileSync(src, path.join(catTargetDir, normalizedName + '.webp'));
    } else if (normalizedName) {
        fs.copyFileSync(src, path.join(catTargetDir, normalizedName));
    }
    console.log(`Copied ${file} -> /images/categories/${file}`);
}

console.log('\nAll brand and category images copied successfully!');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = 'C:/Users/moham/Downloads/صور منتجات حوا';
const targetDir1 = path.join(__dirname, '../public/uploads/products');
const targetDir2 = path.join(__dirname, '../backend/storage/app/public/products');

fs.mkdirSync(targetDir1, { recursive: true });
fs.mkdirSync(targetDir2, { recursive: true });

async function convertAll() {
    const files = fs.readdirSync(sourceDir).filter(f => f.match(/\.png$/i));
    console.log(`Found ${files.length} PNG images in ${sourceDir}`);
    
    let totalInBytes = 0;
    let totalOutBytes = 0;
    let count = 0;

    for (const file of files) {
        const barcode = path.basename(file, path.extname(file));
        const srcPath = path.join(sourceDir, file);
        const destPath1 = path.join(targetDir1, `${barcode}.webp`);
        const destPath2 = path.join(targetDir2, `${barcode}.webp`);

        const inSize = fs.statSync(srcPath).size;
        totalInBytes += inSize;

        const buffer = await sharp(srcPath)
            .webp({ quality: 85 })
            .toBuffer();

        fs.writeFileSync(destPath1, buffer);
        fs.writeFileSync(destPath2, buffer);

        totalOutBytes += buffer.length;
        count++;
    }

    console.log(`Successfully converted ${count} images to WebP.`);
    console.log(`Original total size: ${(totalInBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Optimized WebP size: ${(totalOutBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Savings: ${(100 - (totalOutBytes / totalInBytes * 100)).toFixed(1)}%`);
}

convertAll().catch(err => {
    console.error('Error during conversion:', err);
    process.exit(1);
});

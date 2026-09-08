const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function renderOgImage() {
    const inputPath = path.resolve('public/logo.jpeg');
    const outputPath = path.resolve('public/og-image.jpg');

    if (!fs.existsSync(inputPath)) {
        throw new Error(`Source logo not found at: ${inputPath}`);
    }

    console.log('Generating 1080x1080 social share og-image.jpg from logo with bg...');

    await sharp(inputPath)
        .resize(1080, 1080, {
            fit: 'contain',
            background: '#fae9c7',
        })
        .jpeg({
            quality: 90,
            progressive: true,
        })
        .toFile(outputPath);

    const stat = fs.statSync(outputPath);
    console.log('Successfully generated public/og-image.jpg. File size:', stat.size, 'bytes');
}

renderOgImage().catch((err) => {
    console.error('Error generating og-image:', err);
    process.exit(1);
});

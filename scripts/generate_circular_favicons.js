const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const inputPath = path.join(rootDir, 'public/logo.png');

async function createCircularIcon(size, paddingRatio = 0.84) {
    // 1. First trim any outer transparent padding from the Hawa logo for optimal centering and scale
    const trimmedLogoBuffer = await sharp(inputPath).trim().toBuffer();
    const logoSize = Math.round(size * paddingRatio);
    
    // 2. Create a crisp white circular background
    const circleSvg = Buffer.from(
        `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#ffffff"/>
        </svg>`
    );

    const backgroundCircle = await sharp(circleSvg).png().toBuffer();

    // 3. Resize the logo with transparency
    const resizedLogo = await sharp(trimmedLogoBuffer)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // 4. Composite resized logo in the center of the white circle
    const finalIcon = await sharp(backgroundCircle)
        .composite([{
            input: resizedLogo,
            gravity: 'center'
        }])
        .png()
        .toBuffer();

    return finalIcon;
}

async function generateAllCircularIcons() {
    console.log(`Generating Hawa logo browser tab icons from ${inputPath}...`);

    // 512x512
    const icon512 = await createCircularIcon(512);
    fs.writeFileSync(path.join(rootDir, 'public/android-chrome-512x512.png'), icon512);

    // 192x192
    const icon192 = await createCircularIcon(192);
    fs.writeFileSync(path.join(rootDir, 'public/android-chrome-192x192.png'), icon192);
    fs.writeFileSync(path.join(rootDir, 'public/icon.png'), icon192);
    fs.writeFileSync(path.join(rootDir, 'app/icon.png'), icon192);

    // 180x180 (Apple Touch Icon)
    const icon180 = await createCircularIcon(180);
    fs.writeFileSync(path.join(rootDir, 'public/apple-touch-icon.png'), icon180);
    fs.writeFileSync(path.join(rootDir, 'public/apple-icon.png'), icon180);
    fs.writeFileSync(path.join(rootDir, 'app/apple-icon.png'), icon180);

    // 32x32
    const icon32 = await createCircularIcon(32, 0.88);
    fs.writeFileSync(path.join(rootDir, 'public/favicon-32x32.png'), icon32);
    fs.writeFileSync(path.join(rootDir, 'public/favicon.ico'), icon32);
    fs.writeFileSync(path.join(rootDir, 'app/favicon.ico'), icon32);

    // 16x16
    const icon16 = await createCircularIcon(16, 0.90);
    fs.writeFileSync(path.join(rootDir, 'public/favicon-16x16.png'), icon16);

    console.log("✅ All Hawa browser tab icons generated successfully!");
}

generateAllCircularIcons().catch(console.error);


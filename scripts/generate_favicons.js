const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const inputPath = path.join(rootDir, 'public/logo.png');

async function generateFavicons() {
    const trimmedLogoBuffer = await sharp(inputPath).trim().toBuffer();
    const metadata = await sharp(trimmedLogoBuffer).metadata();
    console.log(`Trimmed Hawa logo: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // 1. Generate 32x32 PNG for favicon
    const fav32Buffer = await sharp(trimmedLogoBuffer)
        .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();
    
    fs.writeFileSync(path.join(rootDir, 'public/favicon-32x32.png'), fav32Buffer);
    fs.writeFileSync(path.join(rootDir, 'public/favicon.ico'), fav32Buffer);
    fs.writeFileSync(path.join(rootDir, 'app/favicon.ico'), fav32Buffer);

    // 2. Generate 16x16 PNG
    await sharp(trimmedLogoBuffer)
        .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(rootDir, 'public/favicon-16x16.png'));

    // 3. Generate 180x180 Apple Touch Icon
    const appleIconBuffer = await sharp(trimmedLogoBuffer)
        .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();
    
    fs.writeFileSync(path.join(rootDir, 'public/apple-touch-icon.png'), appleIconBuffer);
    fs.writeFileSync(path.join(rootDir, 'app/apple-icon.png'), appleIconBuffer);

    // 4. Generate 192x192 & 512x512 PWA icons & app/icon.png
    const icon192Buffer = await sharp(trimmedLogoBuffer)
        .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();
    
    fs.writeFileSync(path.join(rootDir, 'public/android-chrome-192x192.png'), icon192Buffer);
    fs.writeFileSync(path.join(rootDir, 'public/icon.png'), icon192Buffer);
    fs.writeFileSync(path.join(rootDir, 'app/icon.png'), icon192Buffer);

    await sharp(trimmedLogoBuffer)
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(path.join(rootDir, 'public/android-chrome-512x512.png'));

    console.log("✅ All Hawa favicons generated!");
}

generateFavicons().catch(console.error);


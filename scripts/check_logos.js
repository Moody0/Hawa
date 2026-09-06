const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const files = ['logo.png', 'logo.jpeg', 'images/logo.png', 'favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'icon.png', 'apple-touch-icon.png'];
for (const f of files) {
    const fullPath = path.join(rootDir, 'public', f);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`public/${f}: size=${stats.size} bytes`);
    } else {
        console.log(`public/${f}: NOT FOUND`);
    }
}


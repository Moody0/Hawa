const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// A production server must only start from a genuine completed Next.js build.
const buildIdPath = path.join(__dirname, '..', '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdPath)) {
    console.error('Missing .next/BUILD_ID. Run a successful production build before starting the server.');
    process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
    const mediaDir = process.env.MEDIA_STORAGE_DIR;
    if (!mediaDir || !path.isAbsolute(mediaDir)) {
        console.error('MEDIA_STORAGE_DIR must be an absolute persistent path in production.');
        process.exit(1);
    }
    fs.mkdirSync(mediaDir, { recursive: true });
}

const port = process.env.PORT || '3000';
const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, 'start', '-p', port], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
});

child.on('exit', (code) => process.exit(code || 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

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
const prewarmScript = path.join(__dirname, 'prewarm-images.js');

// Populate the durable proxy cache in the background so a visitor is not the
// first caller waiting on a slow third-party image host after a deployment.
const prewarm = (process.env.PREWARM_IMAGES_ON_START === 'false' || !fs.existsSync(prewarmScript))
    ? null
    : spawn(process.execPath, [prewarmScript], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env,
      });

let isShuttingDown = false;
let currentChild = null;
let consecutiveFastCrashes = 0;
let lastStartTime = 0;

function startChild() {
    if (isShuttingDown) return;
    lastStartTime = Date.now();
    const child = spawn(process.execPath, [nextBin, 'start', '-p', port], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env,
    });
    currentChild = child;

    child.on('exit', (code, signal) => {
        if (isShuttingDown) {
            process.exit(code || 0);
            return;
        }

        const uptime = (Date.now() - lastStartTime) / 1000;
        if (uptime < 5) {
            consecutiveFastCrashes++;
        } else {
            consecutiveFastCrashes = 0;
        }

        if (consecutiveFastCrashes >= 3) {
            console.error(`\n[Server Supervisor] Server exited immediately 3 consecutive times. Port ${port} is likely already occupied by another application (e.g. another dev server). Stopping supervisor to prevent infinite loop.`);
            process.exit(1);
            return;
        }

        console.warn(`[Server Supervisor] Next.js process exited (code=${code}, signal=${signal}). Restarting in 1s...`);
        setTimeout(startChild, 1000);
    });
}

process.on('SIGINT', () => {
    isShuttingDown = true;
    prewarm?.kill('SIGINT');
    if (currentChild) currentChild.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    isShuttingDown = true;
    prewarm?.kill('SIGTERM');
    if (currentChild) currentChild.kill('SIGTERM');
    process.exit(0);
});

startChild();

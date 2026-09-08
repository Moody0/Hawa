const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Ensure BUILD_ID exists before starting Next.js production server
const buildIdPath = path.join(__dirname, '..', '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdPath)) {
    const manifestPath = path.join(__dirname, '..', '.next', 'build-manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const file = (manifest.lowPriorityFiles || []).find((f) => f.startsWith('static/'));
            if (file) {
                const match = file.match(/^static\/([^/]+)\//);
                if (match && match[1]) {
                    fs.writeFileSync(buildIdPath, match[1].trim());
                }
            }
        } catch {
            // fallback
        }
    }
    if (!fs.existsSync(buildIdPath)) {
        try {
            fs.writeFileSync(buildIdPath, 'production-build-id');
        } catch {
            // ignore
        }
    }
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

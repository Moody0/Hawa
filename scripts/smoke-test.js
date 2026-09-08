#!/usr/bin/env node

/**
 * Hawa Website Production Route & API Smoke Automation (Phase 2.2)
 *
 * Validates critical public pages and APIs against a running server.
 * Handles server lifecycle (if not already running), status codes,
 * content types, and absence of server-error HTML.
 * Terminates cleanly on Windows and Unix CI environments.
 */

const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');
const path = require('path');

function ensureBuildId() {
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
                        return;
                    }
                }
            } catch {
                // ignore
            }
        }
        try {
            fs.writeFileSync(buildIdPath, 'production-build-id');
        } catch {
            // ignore
        }
    }
}

const ROUTES = [
    // Public Pages (Expected 200, Content-Type: text/html)
    { path: '/', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/products', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/brands', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/categories', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/account/login', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/account/register', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/cart', expectedStatus: [200], contentType: 'text/html', type: 'page' },
    { path: '/place-order', expectedStatus: [200], contentType: 'text/html', type: 'page' },

    // Public & Customer APIs (Expected 200 / 401, Content-Type: application/json)
    { path: '/api/products', expectedStatus: [200], contentType: 'application/json', type: 'api' },
    { path: '/api/categories', expectedStatus: [200], contentType: 'application/json', type: 'api' },
    { path: '/api/main-categories', expectedStatus: [200], contentType: 'application/json', type: 'api' },
    { path: '/api/navigation', expectedStatus: [200], contentType: 'application/json', type: 'api' },
    { path: '/api/settings', expectedStatus: [200], contentType: 'application/json', type: 'api' },
    { path: '/api/customer/auth/me', expectedStatus: [200, 401], contentType: 'application/json', type: 'api' },
];

const SERVER_ERROR_PATTERNS = [
    'Application error: a server-side exception has occurred',
    'Internal Server Error',
    '500 Internal Server Error',
    'Unhandled Runtime Error',
    'TypeError: ',
    'ReferenceError: ',
];

function checkPort(port) {
    return new Promise((resolve) => {
        const client = http.get(`http://127.0.0.1:${port}`, () => {
            resolve(true);
        }).on('error', () => {
            resolve(false);
        });
        client.setTimeout(1000, () => {
            client.destroy();
            resolve(false);
        });
    });
}

function fetchRoute(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = http.request(
            {
                hostname: parsed.hostname,
                port: parsed.port,
                path: parsed.pathname + parsed.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Hawa-SmokeTest-Runner/1.0',
                    'Accept': '*/*',
                },
            },
            (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body,
                    });
                });
            }
        );

        req.on('error', (err) => reject(err));
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
        });
        req.end();
    });
}

async function waitForServer(baseUrl, maxRetries = 30, intervalMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const res = await fetchRoute(baseUrl, 2000);
            if (res && res.status) return true;
        } catch {
            // retry
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
}

function killProcess(proc) {
    if (!proc || !proc.pid) return;
    try {
        if (process.platform === 'win32') {
            execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' });
        } else {
            process.kill(-proc.pid, 'SIGKILL');
        }
    } catch {
        try {
            proc.kill('SIGKILL');
        } catch {
            // ignore
        }
    }
}

async function runSmokeTests() {
    console.log('🚀 Starting Hawa Production Route & API Smoke Automation...');
    ensureBuildId();

    let serverProcess = null;
    let baseUrl = process.env.HAWA_TEST_URL || process.env.TEST_URL;
    let port = 3000;

    if (!baseUrl) {
        // Check if server is already running on 3000
        const isRunning = await checkPort(port);
        if (isRunning) {
            baseUrl = `http://127.0.0.1:${port}`;
            console.log(`ℹ Detected existing server running on ${baseUrl}`);
        } else {
            port = 3005;
            baseUrl = `http://127.0.0.1:${port}`;
            console.log(`ℹ Starting production Next.js server on port ${port}...`);

            const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
            serverProcess = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
                cwd: path.join(__dirname, '..'),
                env: {
                    ...process.env,
                    PORT: String(port),
                    NODE_ENV: 'production',
                },
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: process.platform !== 'win32',
            });

            serverProcess.stderr.on('data', (d) => {
                const text = d.toString();
                if (text.includes('Error')) console.error(`[Server stderr]: ${text.trim()}`);
            });

            const ready = await waitForServer(baseUrl, 35, 1000);
            if (!ready) {
                console.error('❌ Failed to start Next.js server within timeout');
                killProcess(serverProcess);
                process.exit(1);
            }
            console.log(`✅ Production server ready at ${baseUrl}`);
        }
    }

    let passedCount = 0;
    let failedCount = 0;
    const failures = [];

    for (const route of ROUTES) {
        const fullUrl = `${baseUrl}${route.path}`;
        const label = `${route.type.toUpperCase()} ${route.path}`;

        try {
            const response = await fetchRoute(fullUrl);
            const statusOk = route.expectedStatus.includes(response.status);
            const contentTypeHeader = response.headers['content-type'] || '';
            const contentTypeOk = contentTypeHeader.includes(route.contentType);

            // Check for server error markers in body
            let hasServerError = false;
            let errorMatched = null;
            for (const pattern of SERVER_ERROR_PATTERNS) {
                if (response.body.includes(pattern)) {
                    hasServerError = true;
                    errorMatched = pattern;
                    break;
                }
            }

            if (statusOk && contentTypeOk && !hasServerError) {
                console.log(`  ✓ ${label} -> HTTP ${response.status} (${contentTypeHeader.split(';')[0]})`);
                passedCount++;
            } else {
                const reasons = [];
                if (!statusOk) reasons.push(`status ${response.status} not in [${route.expectedStatus.join(', ')}]`);
                if (!contentTypeOk) reasons.push(`content-type '${contentTypeHeader}' expected '${route.contentType}'`);
                if (hasServerError) reasons.push(`matched error pattern: "${errorMatched}"`);

                console.error(`  ✗ ${label} -> FAILED: ${reasons.join('; ')}`);
                failedCount++;
                failures.push({ route: route.path, reasons });
            }
        } catch (err) {
            console.error(`  ✗ ${label} -> NETWORK/REQUEST ERROR: ${err.message}`);
            failedCount++;
            failures.push({ route: route.path, reasons: [err.message] });
        }
    }

    if (serverProcess) {
        console.log('🧹 Shutting down local test server...');
        killProcess(serverProcess);
    }

    console.log('\n========================================');
    console.log(`Smoke Test Results: ${passedCount} passed, ${failedCount} failed (${ROUTES.length} total)`);
    console.log('========================================');

    if (failedCount > 0) {
        console.error('❌ Smoke tests failed on routes:');
        failures.forEach((f) => console.error(`   - ${f.route}: ${f.reasons.join(', ')}`));
        process.exit(1);
    } else {
        console.log('🎉 All production smoke routes and APIs verified successfully!');
        process.exit(0);
    }
}

// Cleanup on unhandled termination
process.on('SIGINT', () => process.exit(1));
process.on('SIGTERM', () => process.exit(1));

runSmokeTests().catch((err) => {
    console.error('Fatal smoke test runner error:', err);
    process.exit(1);
});

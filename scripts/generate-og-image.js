const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function renderOgImage() {
    const width = 1200;
    const height = 630;

    const logoPath = path.resolve('public/images/logo-header.webp');
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    const logoSrc = `data:image/webp;base64,${logoBase64}`;

    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Figtree:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                width: ${width}px;
                height: ${height}px;
                background-color: #060E1A;
                background-image: 
                    radial-gradient(circle at 85% 25%, rgba(138, 99, 5, 0.32) 0%, transparent 55%),
                    radial-gradient(circle at 15% 75%, rgba(30, 58, 138, 0.28) 0%, transparent 50%),
                    linear-gradient(135deg, #07111F 0%, #0B192C 50%, #050B14 100%);
                font-family: 'Cairo', system-ui, -apple-system, sans-serif;
                color: #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                overflow: hidden;
            }
            .frame {
                width: 100%;
                height: 100%;
                border: 1.5px solid rgba(229, 181, 74, 0.45);
                border-radius: 28px;
                padding: 44px 50px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                background: rgba(11, 25, 44, 0.35);
                backdrop-filter: blur(12px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            .grid-bg {
                position: absolute;
                inset: 0;
                background-size: 40px 40px;
                background-image: 
                    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
                pointer-events: none;
            }
            /* Right Side - Content */
            .content-side {
                display: flex;
                flex-direction: column;
                justify-content: center;
                max-width: 660px;
                z-index: 10;
            }
            .top-badge {
                display: inline-flex;
                align-items: center;
                align-self: flex-start;
                gap: 8px;
                background: linear-gradient(135deg, rgba(138, 99, 5, 0.35), rgba(138, 99, 5, 0.15));
                border: 1px solid rgba(229, 181, 74, 0.4);
                color: #E5B54A;
                font-size: 15px;
                font-weight: 700;
                padding: 6px 16px;
                border-radius: 12px;
                margin-bottom: 16px;
            }
            .headline {
                font-size: 44px;
                font-weight: 900;
                line-height: 1.22;
                color: #FFFFFF;
                letter-spacing: -0.5px;
                margin-bottom: 10px;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            .company-name {
                font-size: 22px;
                font-weight: 800;
                color: #E5B54A;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            .company-name span.en {
                font-family: 'Figtree', sans-serif;
                font-size: 18px;
                font-weight: 600;
                color: #CBD5E1;
                direction: ltr;
            }
            .description {
                font-size: 17px;
                font-weight: 500;
                color: #94A3B8;
                line-height: 1.45;
                margin-bottom: 20px;
            }
            /* Brands list */
            .brands-bar {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                padding: 10px 18px;
                font-size: 15px;
                font-weight: 700;
                color: #E2E8F0;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 22px;
                white-space: nowrap;
            }
            .brands-bar span.dot {
                color: #8A6305;
                font-size: 12px;
            }
            /* Bottom Feature Badges */
            .features-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .feature-pill {
                display: flex;
                align-items: center;
                gap: 6px;
                background: #0F1D30;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 7px 14px;
                font-size: 13.5px;
                font-weight: 700;
            }
            .feature-pill.cyan {
                color: #38BDF8;
                border-color: rgba(56, 189, 248, 0.3);
            }
            .feature-pill.green {
                color: #4ADE80;
                border-color: rgba(74, 222, 128, 0.3);
            }
            .feature-pill.amber {
                color: #FBBF24;
                border-color: rgba(251, 191, 36, 0.3);
            }

            /* Left Side - Logo Showcase Card */
            .logo-side {
                width: 370px;
                height: 380px;
                border-radius: 22px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
                border: 1.5px solid rgba(229, 181, 74, 0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px;
                position: relative;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
            }
            .logo-side img {
                max-width: 280px;
                max-height: 200px;
                object-fit: contain;
                filter: drop-shadow(0 10px 25px rgba(229, 181, 74, 0.2));
            }
            .logo-footer {
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .domain-badge {
                font-family: 'Figtree', sans-serif;
                font-size: 18px;
                font-weight: 800;
                letter-spacing: 1px;
                color: #E5B54A;
                background: rgba(138, 99, 5, 0.2);
                border: 1px solid rgba(229, 181, 74, 0.35);
                padding: 5px 16px;
                border-radius: 20px;
            }
            .tagline-en {
                font-family: 'Figtree', sans-serif;
                font-size: 12px;
                font-weight: 600;
                color: #94A3B8;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="frame">
            <div class="grid-bg"></div>

            <!-- Right: Content -->
            <div class="content-side">
                <div class="top-badge">
                    ✨ المنصة الرائدة لتوريد كبرى الوكالات بالجملة
                </div>

                <h1 class="headline">
                    كل منتجات وكالاتك… بطلب واحد
                </h1>

                <div class="company-name">
                    <span>حوا للتوزيع والتجارة</span>
                    <span style="color: #64748B;">•</span>
                    <span class="en">Hawa Distribution & Trading</span>
                </div>

                <p class="description">
                    توزيع وتوريد فوري للمحلات والسوبرماركت وتجار الجملة والتجزئة بأسعار الوكالة المعتمدة.
                </p>

                <div class="brands-bar">
                    <span>زوان</span>
                    <span class="dot">•</span>
                    <span>الريف</span>
                    <span class="dot">•</span>
                    <span>حليبنا</span>
                    <span class="dot">•</span>
                    <span>صن بل</span>
                    <span class="dot">•</span>
                    <span>سيلفر فيش</span>
                    <span class="dot">•</span>
                    <span>بوفالو</span>
                    <span class="dot">•</span>
                    <span>روكافيرا</span>
                    <span class="dot">•</span>
                    <span>المغربي</span>
                </div>

                <div class="features-row">
                    <div class="feature-pill cyan">
                        <span>⚡</span>
                        <span>توزيع فوري ومباشر</span>
                    </div>
                    <div class="feature-pill green">
                        <span>🛡️</span>
                        <span>وكالات تجارية معتمدة</span>
                    </div>
                    <div class="feature-pill amber">
                        <span>💬</span>
                        <span>طلب فوري عبر واتساب</span>
                    </div>
                </div>
            </div>

            <!-- Left: Logo Card -->
            <div class="logo-side">
                <img src="${logoSrc}" alt="Hawa Distribution Logo" />
                <div class="logo-footer">
                    <div class="domain-badge">hawatrading.com</div>
                    <div class="tagline-en">Wholesale FMCG & Agency Hub</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    // Small delay to ensure Google WebFonts have fully painted
    await page.waitForTimeout(1000);

    const screenshotBuffer = await page.screenshot({ type: 'png' });
    await browser.close();

    // Optimize with sharp: progressive JPEG, quality 88 (under 120KB for instant WhatsApp loading)
    await sharp(screenshotBuffer)
        .jpeg({ quality: 88, progressive: true })
        .toFile('public/og-image.jpg');

    const stat = fs.statSync('public/og-image.jpg');
    console.log('Successfully rendered professional og-image.jpg. File size:', stat.size, 'bytes');
}

renderOgImage().catch(console.error);

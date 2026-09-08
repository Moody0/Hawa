const sharp = require('sharp');

const svg = `
<svg viewBox="0 0 240 28" width="240" height="28" xmlns="http://www.w3.org/2000/svg">
  <path d="M 0 0 L 20 0 C 65 0, 80 26, 120 26 C 160 26, 175 0, 220 0 L 240 0 Z" fill="#0B192C" />
  <path d="M 0 0 L 20 0 C 65 0, 80 26, 120 26 C 160 26, 175 0, 220 0 L 240 0" stroke="rgba(229, 181, 74, 0.45)" stroke-width="1.5" fill="none" />
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/images/test_symmetric_curve2.png')
  .then(() => console.log('OK'));

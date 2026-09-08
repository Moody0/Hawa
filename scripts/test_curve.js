const sharp = require('sharp');
const fs = require('fs');

const svg = `
<svg viewBox="0 0 240 28" width="240" height="28" xmlns="http://www.w3.org/2000/svg">
  <path d="M 0 0 L 30 0 C 75 0, 105 26, 150 26 C 190 26, 215 2, 240 0 Z" fill="#0B192C" />
  <path d="M 0 0 L 30 0 C 75 0, 105 26, 150 26 C 190 26, 215 2, 240 0" stroke="rgba(229, 181, 74, 0.45)" stroke-width="1.5" fill="none" />
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/images/test_curve.png')
  .then(() => console.log('Rendered test_curve.png successfully'));

const fs = require('fs/promises');
const sharp = require('sharp');

const logoPath = '/Users/emanuel/Library/Mobile Documents/com~apple~CloudDocs/Applications/centro-de-nueva-esperanza-app-main/backend/frontend/dist/cne_logo_black.svg';
const outputPath = '/Users/emanuel/Library/Mobile Documents/com~apple~CloudDocs/Applications/centro-de-nueva-esperanza-app-main/backend/frontend/dist/';

async function generateIcons() {
  try {
    // Create white-on-black versions
    await Promise.all([
      generateIcon(180, 'icon-180x180.png'),
      generateIcon(192, 'icon-192x192.png'),
      generateIcon(512, 'icon-512x512.png')
    ]);
    
    console.log('Icons generated successfully');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

async function generateIcon(size, filename) {
  await sharp(logoPath)
    .resize(size, size)
    .flatten({ background: '#000000' })
    .composite([{
      input: Buffer.from(`<svg><rect width="${size}" height="${size}" fill="black"/></svg>`),
      blend: 'dest-over'
    }])
    .toFile(`${outputPath}${filename}`);
}

generateIcons();

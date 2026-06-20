import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, '../../images/cne_logo_transparent.png');
const iosSplashDir = path.resolve(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');
const androidResDir = path.resolve(__dirname, '../android/app/src/main/res');

const LIGHT_BG = '#FFFFFF';
const DARK_BG = '#0E1A0B'; // Dark Forest Green — matches the app's dark theme background
const LOGO_RATIO = 0.22; // logo size relative to the shorter canvas edge

// Android resource dirs that ship a splash.png. We overwrite each with the
// light version and add a sibling "-night" dir with the dark version, so
// Android picks the right one automatically based on system theme.
const ANDROID_TARGETS = [
  { dir: 'drawable', width: 480, height: 320 },
  { dir: 'drawable-land-hdpi', width: 800, height: 480 },
  { dir: 'drawable-land-mdpi', width: 480, height: 320 },
  { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
  { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
  { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  { dir: 'drawable-port-hdpi', width: 480, height: 800 },
  { dir: 'drawable-port-mdpi', width: 320, height: 480 },
  { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
  { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
  { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
];

// Android resource-qualifier order is orientation, then night, then density
// (e.g. "drawable-land-night-hdpi", not "drawable-night-land-hdpi").
function nightDirFor(dir) {
  const tokens = dir.split('-');
  const insertAt = tokens[1] === 'land' || tokens[1] === 'port' ? 2 : 1;
  tokens.splice(insertAt, 0, 'night');
  return tokens.join('-');
}

// Recolor a logo to a solid color while preserving its original alpha shape.
// 'atop' (source-atop) paints the overlay's color wherever the base image has
// ink, masked by the base's alpha — unlike 'dest-in', which just re-masks the
// base's own (unchanged) color and was the bug: it left the dark-mode logo
// black instead of turning it white.
async function tintLogo(logoBuffer, hex) {
  const { width, height } = await sharp(logoBuffer).metadata();
  return sharp(logoBuffer)
    .composite([{
      input: Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="${hex}"/></svg>`),
      blend: 'atop',
    }])
    .png()
    .toBuffer();
}

async function buildSplash({ width, height, background, logoBuffer }) {
  const logoSize = Math.round(Math.min(width, height) * LOGO_RATIO);
  const resizedLogo = await sharp(logoBuffer).resize(logoSize, logoSize).toBuffer();
  return sharp({ create: { width, height, channels: 4, background } })
    .composite([{ input: resizedLogo, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found at: ${logoPath}`);
  }
  console.log(`Using logo: ${logoPath}`);

  const logoBuffer = await sharp(logoPath).toBuffer();
  const whiteLogoBuffer = await tintLogo(logoBuffer, '#FFFFFF');

  // ── iOS ──
  const iosSize = 2732;
  const iosLight = await buildSplash({ width: iosSize, height: iosSize, background: LIGHT_BG, logoBuffer });
  const iosDark = await buildSplash({ width: iosSize, height: iosSize, background: DARK_BG, logoBuffer: whiteLogoBuffer });

  const lightFiles = ['splash-light-1x.png', 'splash-light-2x.png', 'splash-light-3x.png'];
  const darkFiles = ['splash-dark-1x.png', 'splash-dark-2x.png', 'splash-dark-3x.png'];
  for (const file of lightFiles) {
    await fs.promises.writeFile(path.join(iosSplashDir, file), iosLight);
    console.log(`Generated: ios/${file}`);
  }
  for (const file of darkFiles) {
    await fs.promises.writeFile(path.join(iosSplashDir, file), iosDark);
    console.log(`Generated: ios/${file}`);
  }

  // ── Android ──
  for (const target of ANDROID_TARGETS) {
    const light = await buildSplash({ width: target.width, height: target.height, background: LIGHT_BG, logoBuffer });
    const dark = await buildSplash({ width: target.width, height: target.height, background: DARK_BG, logoBuffer: whiteLogoBuffer });

    const nightDir = nightDirFor(target.dir);
    const lightDirPath = path.join(androidResDir, target.dir);
    const darkDirPath = path.join(androidResDir, nightDir);
    await fs.promises.mkdir(darkDirPath, { recursive: true });

    await fs.promises.writeFile(path.join(lightDirPath, 'splash.png'), light);
    await fs.promises.writeFile(path.join(darkDirPath, 'splash.png'), dark);
    console.log(`Generated: android/${target.dir}/splash.png + android/${nightDir}/splash.png`);
  }

  console.log('Splash screens generated successfully!');
}

main().catch((error) => {
  console.error('Error generating splash screens:', error);
  process.exit(1);
});

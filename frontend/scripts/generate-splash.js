import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, '../../images/cne_logo_transparent.png');
const iosSplashDir = path.resolve(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');

async function main() {
  try {
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo file not found at: ${logoPath}`);
    }

    console.log(`Using logo: ${logoPath}`);
    console.log(`Target directory: ${iosSplashDir}`);

    // Dimensions of splash screen
    const width = 2732;
    const height = 2732;
    const logoSize = 600; // Logo size centered in the splash screen

    // 1. Prepare standard logo (resized)
    const logoBuffer = await sharp(logoPath)
      .resize(logoSize, logoSize)
      .toBuffer();

    // 2. Prepare white logo for dark mode
    // We overlay a solid white rect and use 'dest-in' to tint non-transparent pixels white
    const whiteLogoBuffer = await sharp(logoBuffer)
      .composite([{
        input: Buffer.from(`<svg><rect width="${logoSize}" height="${logoSize}" fill="#FFFFFF"/></svg>`),
        blend: 'dest-in'
      }])
      .toBuffer();

    // 3. Generate Light Splash Screen
    // Base light background is #FFFFFF
    const lightSplash = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: '#FFFFFF'
      }
    })
    .composite([{
      input: logoBuffer,
      gravity: 'center'
    }])
    .png()
    .toBuffer();

    // 4. Generate Dark Splash Screen
    // Base dark background is #0E1A0B (Dark Forest Green)
    const darkSplash = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: '#0E1A0B'
      }
    })
    .composite([{
      input: whiteLogoBuffer,
      gravity: 'center'
    }])
    .png()
    .toBuffer();

    // 5. Save iOS images
    const lightFiles = ['splash-light-1x.png', 'splash-light-2x.png', 'splash-light-3x.png'];
    const darkFiles = ['splash-dark-1x.png', 'splash-dark-2x.png', 'splash-dark-3x.png'];

    for (const file of lightFiles) {
      const outputPath = path.join(iosSplashDir, file);
      await fs.promises.writeFile(outputPath, lightSplash);
      console.log(`Generated: ${outputPath}`);
    }

    for (const file of darkFiles) {
      const outputPath = path.join(iosSplashDir, file);
      await fs.promises.writeFile(outputPath, darkSplash);
      console.log(`Generated: ${outputPath}`);
    }

    console.log('Splash screens generated successfully!');

  } catch (error) {
    console.error('Error generating splash screens:', error);
    process.exit(1);
  }
}

main();

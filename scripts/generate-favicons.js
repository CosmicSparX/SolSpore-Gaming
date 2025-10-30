const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateFavicons() {
  console.log('Generating favicons from logo...');
  
  const logoPath = path.join(__dirname, '../public/images/SolSpore_Logo.jpg');
  const outputDir = path.join(__dirname, '../public/favicons');
  
  // Make sure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate various sizes
  try {
    // Regular favicon sizes
    await sharp(logoPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'icon-16x16.png'));
    
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'icon-32x32.png'));
      
    await sharp(logoPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192x192.png'));
      
    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    
    // Apple Touch Icon
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
      
    // Also create ICO file for favicon.ico
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
    
    console.log('Successfully generated all favicon images!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons(); 
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple script to copy favicon.png to favicon.ico
// In a production environment, you would use a proper ICO converter

try {
  console.log('Converting favicon.png to favicon.ico...');
  
  const sourceFile = path.join(__dirname, '../public/favicons/favicon.png');
  const targetFile = path.join(__dirname, '../public/favicons/favicon.ico');
  
  // Simple copy for now - browsers will accept PNG files with .ico extension
  fs.copyFileSync(sourceFile, targetFile);
  
  console.log('Successfully created favicon.ico!');
} catch (error) {
  console.error('Error creating favicon.ico:', error);
} 
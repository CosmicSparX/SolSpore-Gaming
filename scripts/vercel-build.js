#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log the start of the build process
console.log('🚀 Starting Vercel build preparation...');

// Generate favicons if needed
try {
  console.log('Generating favicons...');
  require('./generate-favicons');
  require('./convert-favicon');
  console.log('✅ Favicons generated successfully');
} catch (error) {
  console.warn('⚠️ Error generating favicons:', error.message);
  console.log('Continuing build process...');
}

// Print environment for debugging (without secrets)
console.log('\n📊 Build environment:');
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

// Continue with Next.js build
console.log('\n🏗️ Proceeding with Next.js build...'); 
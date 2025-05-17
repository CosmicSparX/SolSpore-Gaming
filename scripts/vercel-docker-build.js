#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel Docker build preparation...');

// Function to run shell commands and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

// Check if docker-compose is installed
function isDockerComposeInstalled() {
  try {
    execSync('docker-compose --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main build function
async function build() {
  try {
    console.log('📊 Build environment:');
    console.log(`Node version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    
    // Check if we're running on Vercel
    const isVercel = process.env.VERCEL === '1';
    console.log(`Running on Vercel: ${isVercel ? 'Yes' : 'No'}`);
    
    if (isVercel) {
      // Install Docker Compose on Vercel
      if (!isDockerComposeInstalled()) {
        console.log('🐳 Installing Docker Compose...');
        
        // Create a directory for binaries if it doesn't exist
        if (!fs.existsSync('./bin')) {
          fs.mkdirSync('./bin');
        }
        
        // Install Docker Compose using pip (Python's package manager)
        try {
          // First, check if pip is available
          runCommand('pip --version');
          
          // Install Docker Compose
          runCommand('pip install docker-compose');
        } catch (error) {
          console.log('Cannot install via pip, downloading binary directly...');
          
          // Download Docker Compose binary directly
          runCommand('curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o ./bin/docker-compose');
          runCommand('chmod +x ./bin/docker-compose');
          
          // Add to PATH
          process.env.PATH = `${process.cwd()}/bin:${process.env.PATH}`;
          console.log(`Updated PATH: ${process.env.PATH}`);
        }
      }
    }
    
    // Check for Docker availability
    try {
      runCommand('docker --version');
    } catch (error) {
      console.error('❌ Docker is not available. Cannot proceed with Docker build.');
      console.log('Falling back to standard Next.js build...');
      runCommand('npm run next-build');
      return;
    }
    
    // Check for Docker Compose availability
    if (isDockerComposeInstalled()) {
      console.log('✅ Docker Compose is installed!');
    } else {
      console.error('❌ Failed to install Docker Compose.');
      console.log('Falling back to standard Next.js build...');
      runCommand('npm run next-build');
      return;
    }
    
    // Running Docker Compose build
    console.log('🔨 Building with Docker Compose...');
    runCommand('docker-compose build');
    
    // Extract built files from the Docker container
    console.log('📦 Extracting built files from Docker container...');
    runCommand('docker create --name temp_container solspore-app:latest');
    runCommand('docker cp temp_container:/app/.next ./.next');
    runCommand('docker rm temp_container');
    
    console.log('✅ Docker build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build().catch(error => {
  console.error('Unhandled error during build:', error);
  process.exit(1);
}); 
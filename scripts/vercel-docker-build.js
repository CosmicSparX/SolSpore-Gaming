#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel Docker build preparation...');

// Local path to Docker Compose binary
const dockerComposeBin = path.join(process.cwd(), 'bin', 'docker-compose');

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

// Run command but don't throw if it fails
function tryCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Check if docker-compose is installed
function isDockerComposeInstalled() {
  try {
    if (fs.existsSync(dockerComposeBin)) {
      // Check local binary first
      execSync(`${dockerComposeBin} --version`, { stdio: 'ignore' });
      return true;
    }
    
    // Try global installation
    execSync('docker-compose --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if Docker is available
function isDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
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
    
    // Get system information
    console.log('System information:');
    tryCommand('uname -a').success && console.log(tryCommand('uname -a').output);
    tryCommand('lsb_release -a').success && console.log(tryCommand('lsb_release -a').output);
    tryCommand('cat /etc/os-release').success && console.log(tryCommand('cat /etc/os-release').output);
    
    // Check if we're running on Vercel
    const isVercel = process.env.VERCEL === '1';
    console.log(`Running on Vercel: ${isVercel ? 'Yes' : 'No'}`);
    
    // Check for Docker availability
    console.log('Checking for Docker...');
    if (!isDockerAvailable()) {
      console.log('❌ Docker not found. Attempting to install Docker...');
      
      if (isVercel) {
        try {
          // Check if we can install Docker
          console.log('Checking if we can install Docker in this environment...');
          
          // Try different installation methods based on the environment
          
          // Method 1: Using apt (Debian/Ubuntu)
          const aptResult = tryCommand('command -v apt-get');
          if (aptResult.success) {
            console.log('Attempting Docker installation with apt...');
            tryCommand('apt-get update');
            tryCommand('apt-get install -y docker.io');
          }
          
          // Method 2: Using curl and convenience script
          else {
            console.log('Attempting Docker installation with convenience script...');
            tryCommand('curl -fsSL https://get.docker.com -o get-docker.sh');
            tryCommand('sh get-docker.sh');
          }
          
          // Check if Docker was installed
          if (isDockerAvailable()) {
            console.log('✅ Docker installed successfully!');
          } else {
            console.error('❌ Failed to install Docker.');
            console.log('Falling back to standard Next.js build...');
            runCommand('npm run next-build');
            return;
          }
        } catch (error) {
          console.error('Error during Docker installation:', error.message);
          console.log('Falling back to standard Next.js build...');
          runCommand('npm run next-build');
          return;
        }
      } else {
        console.error('❌ Docker is not available and not attempting installation outside of Vercel.');
        console.log('Falling back to standard Next.js build...');
        runCommand('npm run next-build');
        return;
      }
    } else {
      console.log('✅ Docker is available!');
      runCommand('docker --version');
    }
    
    // Install Docker Compose if needed
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
      }
    }
    
    // Check for Docker Compose availability again
    if (isDockerComposeInstalled()) {
      console.log('✅ Docker Compose is installed!');
      
      // Use the local binary if it exists
      const composeCmd = fs.existsSync(dockerComposeBin) ? dockerComposeBin : 'docker-compose';
      
      // Show Docker Compose version
      runCommand(`${composeCmd} --version`);
      
      // Check if Docker daemon is running
      console.log('Checking if Docker daemon is running...');
      try {
        runCommand('docker info');
        console.log('✅ Docker daemon is running!');
      } catch (error) {
        console.error('❌ Docker daemon is not running. Attempting to start it...');
        
        // Try to start Docker daemon
        tryCommand('systemctl start docker');
        tryCommand('service docker start');
        
        // Check again
        try {
          runCommand('docker info');
          console.log('✅ Docker daemon started successfully!');
        } catch (dockerError) {
          console.error('❌ Could not start Docker daemon.');
          console.log('Falling back to standard Next.js build...');
          runCommand('npm run next-build');
          return;
        }
      }
      
      // Running Docker Compose build
      console.log('🔨 Building with Docker Compose...');
      runCommand(`${composeCmd} build`);
      
      // Extract built files from the Docker container
      console.log('📦 Extracting built files from Docker container...');
      runCommand('docker create --name temp_container solspore-app:latest');
      runCommand('docker cp temp_container:/app/.next ./.next');
      runCommand('docker rm temp_container');
      
      console.log('✅ Docker build completed successfully!');
    } else {
      console.error('❌ Failed to install Docker Compose.');
      console.log('Falling back to standard Next.js build...');
      runCommand('npm run next-build');
      return;
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.log('Falling back to standard Next.js build...');
    tryCommand('npm run next-build');
    process.exit(1);
  }
}

// Run the build
build().catch(error => {
  console.error('Unhandled error during build:', error);
  tryCommand('npm run next-build');
  process.exit(1);
}); 
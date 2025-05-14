const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the path to the .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envFilePath)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: .env.local file already exists.');
  rl.question('Do you want to overwrite it? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Your existing .env.local file was not modified.');
      rl.close();
      return;
    }
    createEnvFile();
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  rl.question('Enter your MongoDB connection string (leave empty for local MongoDB): ', (mongoUri) => {
    // Use default local MongoDB if no input provided
    const connectionString = mongoUri || 'mongodb://localhost:27017/solspore';
    
    rl.question('Which Solana network do you want to use? (devnet, testnet, mainnet-beta) [devnet]: ', (network) => {
      // Default to devnet if no input provided
      const solanaNetwork = network || 'devnet';
      
      // Create the content for the .env.local file
      const envContent = `# MongoDB Connection String
MONGODB_URI=${connectionString}

# Environment
NODE_ENV=development

# Solana cluster endpoint
NEXT_PUBLIC_SOLANA_NETWORK=${solanaNetwork}
`;
      
      // Write the content to the .env.local file
      fs.writeFileSync(envFilePath, envContent);
      
      console.log('\x1b[32m%s\x1b[0m', '\nSuccess! .env.local file has been created with the following configuration:');
      console.log('\x1b[36m%s\x1b[0m', `MongoDB URI: ${connectionString}`);
      console.log('\x1b[36m%s\x1b[0m', `Solana Network: ${solanaNetwork}`);
      console.log('\x1b[33m%s\x1b[0m', '\nNote: Keep your .env.local file secure and never commit it to version control.');
      console.log('\x1b[37m%s\x1b[0m', '\nYou can now run the following commands:');
      console.log('\x1b[37m%s\x1b[0m', '  npm run seed    - To seed your database with initial data');
      console.log('\x1b[37m%s\x1b[0m', '  npm run dev     - To start the development server');
      
      rl.close();
    });
  });
}

rl.on('close', () => {
  process.exit(0);
}); 
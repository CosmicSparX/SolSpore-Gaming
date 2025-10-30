const fs = require('fs');
const path = require('path');

// Define the path to the .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envFilePath)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: .env.local file already exists. Will not overwrite.');
  console.log('If you want to create a new .env.local file, please delete the existing one first.');
  process.exit(0);
}

// Create default content for the .env.local file
const envContent = `# MongoDB Connection String
# For local MongoDB development:
MONGODB_URI=mongodb://localhost:27017/solspore

# Uncomment and replace with your MongoDB Atlas connection string if using Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/solspore?retryWrites=true&w=majority

# Environment
NODE_ENV=development

# Solana cluster endpoint
NEXT_PUBLIC_SOLANA_NETWORK=devnet
`;

// Write the content to the .env.local file
fs.writeFileSync(envFilePath, envContent);

console.log('\x1b[32m%s\x1b[0m', '\nSuccess! .env.local file has been created with default configuration.');
console.log('\x1b[33m%s\x1b[0m', '\nImportant: Edit the .env.local file to add your actual MongoDB connection string if you\'re using MongoDB Atlas.');
console.log('\x1b[33m%s\x1b[0m', 'For local MongoDB, make sure your MongoDB server is running on the default port (27017).');
console.log('\x1b[37m%s\x1b[0m', '\nYou can now run the following commands:');
console.log('\x1b[37m%s\x1b[0m', '  npm run seed    - To seed your database with initial data');
console.log('\x1b[37m%s\x1b[0m', '  npm run dev     - To start the development server'); 
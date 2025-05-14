require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  // Get MongoDB URI from environment variable
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: MONGODB_URI is not defined in your .env.local file.');
    console.log('Please run "npm run setup" or "npm run create-env" to create your .env.local file.');
    process.exit(1);
  }
  
  console.log('\x1b[36m%s\x1b[0m', 'Testing MongoDB connection...');
  console.log('\x1b[90m%s\x1b[0m', `URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials in output
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('\x1b[32m%s\x1b[0m', 'Successfully connected to MongoDB!');
    
    // Get the database name from the connection string or use default
    const dbName = uri.split('/').pop().split('?')[0] || 'solspore';
    
    // Get the database
    const db = client.db(dbName);
    
    // List collections to verify further access
    const collections = await db.listCollections().toArray();
    
    console.log('\x1b[36m%s\x1b[0m', `Connected to database: ${dbName}`);
    console.log('\x1b[36m%s\x1b[0m', `Available collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections found'}`);
    
    console.log('\x1b[32m%s\x1b[0m', '\nConnection test successful! Your MongoDB connection is working correctly.');
    console.log('\x1b[37m%s\x1b[0m', 'You can now run:');
    console.log('\x1b[37m%s\x1b[0m', '  npm run seed    - To seed your database with initial data');
    console.log('\x1b[37m%s\x1b[0m', '  npm run dev     - To start the development server');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error connecting to MongoDB:');
    console.error(error);
    console.log('\n\x1b[33m%s\x1b[0m', 'Troubleshooting tips:');
    console.log('1. Check if your MongoDB server is running (if using local MongoDB)');
    console.log('2. Verify your connection string in .env.local is correct');
    console.log('3. If using MongoDB Atlas, check if your IP is whitelisted in Network Access');
    console.log('4. Verify the username and password in your connection string');
  } finally {
    // Close the connection
    await client.close();
    process.exit(0);
  }
}

testConnection().catch(console.error); 
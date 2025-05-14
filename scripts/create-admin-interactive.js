// Script to create an admin user interactively
const mongoose = require('mongoose');
const crypto = require('crypto');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n\x1b[31mError: MONGODB_URI not found in .env.local\x1b[0m');
  console.error('Please create a .env.local file with your MongoDB connection string:');
  console.error('\nMONGODB_URI=mongodb://localhost:27017/solspore\n');
  rl.close();
  process.exit(1);
}

// Connect to MongoDB
console.log('\n\x1b[36mConnecting to MongoDB...\x1b[0m');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\x1b[32m✓ Connected to MongoDB\x1b[0m\n');
    startPrompt();
  })
  .catch(err => {
    console.error('\x1b[31m✗ Failed to connect to MongoDB\x1b[0m', err);
    rl.close();
    process.exit(1);
  });

// User Schema (simplified version of the TypeScript model)
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profileImage: {
    type: String
  }
}, { timestamps: true });

// Create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Function to hash password
function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
}

// Function to create admin user
async function createAdminUser(username, email, password) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email && existingUser.username === username) {
        console.log('\x1b[31m✗ User with this email AND username already exists\x1b[0m');
      } else if (existingUser.email === email) {
        console.log('\x1b[31m✗ User with this email already exists\x1b[0m');
      } else {
        console.log('\x1b[31m✗ User with this username already exists\x1b[0m');
      }
      return false;
    }
    
    // Generate salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password
    const hashedPassword = hashPassword(password, salt);
    
    // Create new user with admin role
    const user = new User({
      username,
      email,
      password: hashedPassword,
      salt,
      role: 'admin'
    });
    
    // Save the user
    await user.save();
    
    console.log(`\n\x1b[32m✓ Admin user "${username}" created successfully!\x1b[0m\n`);
    console.log('You can now log in with these credentials at http://localhost:3001\n');
    return true;
  } catch (error) {
    console.error('\x1b[31m✗ Error creating admin user:\x1b[0m', error);
    return false;
  }
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Prompt for user information
function startPrompt() {
  console.log('\x1b[1m\x1b[36m=== Create Admin User ===\x1b[0m\n');
  
  promptUsername();
}

function promptUsername() {
  rl.question('\x1b[36mUsername\x1b[0m (3-30 characters): ', (username) => {
    if (!username || username.length < 3 || username.length > 30) {
      console.log('\x1b[31m✗ Username must be between 3 and 30 characters\x1b[0m');
      return promptUsername();
    }
    
    promptEmail(username);
  });
}

function promptEmail(username) {
  rl.question('\x1b[36mEmail\x1b[0m: ', (email) => {
    if (!isValidEmail(email)) {
      console.log('\x1b[31m✗ Please enter a valid email address\x1b[0m');
      return promptEmail(username);
    }
    
    promptPassword(username, email);
  });
}

function promptPassword(username, email) {
  rl.question('\x1b[36mPassword\x1b[0m (min 8 characters): ', async (password) => {
    if (!password || password.length < 8) {
      console.log('\x1b[31m✗ Password must be at least 8 characters long\x1b[0m');
      return promptPassword(username, email);
    }
    
    // Confirm password
    rl.question('\x1b[36mConfirm password\x1b[0m: ', async (confirmPassword) => {
      if (password !== confirmPassword) {
        console.log('\x1b[31m✗ Passwords do not match\x1b[0m');
        return promptPassword(username, email);
      }
      
      // Create the admin user
      const success = await createAdminUser(username, email, password);
      
      if (!success) {
        console.log('\nLet\'s try again with different credentials:\n');
        promptUsername();
      } else {
        rl.close();
        mongoose.connection.close();
      }
    });
  });
}

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\nExiting...');
  rl.close();
  mongoose.connection.close();
  process.exit(0);
}); 
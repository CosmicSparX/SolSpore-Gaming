// Script to create an admin user
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
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
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
      console.log('User with this email or username already exists');
      return;
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
    
    console.log(`Admin user "${username}" created successfully!`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Prompt for user information
function promptUserInfo() {
  rl.question('Username: ', (username) => {
    rl.question('Email: ', (email) => {
      rl.question('Password (min 8 characters): ', async (password) => {
        if (password.length < 8) {
          console.log('Password must be at least 8 characters long');
          rl.close();
          process.exit(1);
        }
        
        await createAdminUser(username, email, password);
        rl.close();
        process.exit(0);
      });
    });
  });
}

// Start the script
console.log('Create Admin User');
console.log('=================');
promptUserInfo(); 
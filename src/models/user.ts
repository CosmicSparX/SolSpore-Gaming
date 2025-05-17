import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  salt?: string;
  role: 'user' | 'admin';
  googleId?: string;
  profileImage?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): boolean;
}

const UserSchema: Schema = new Schema(
  {
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
      select: false, // Don't include password in queries by default
      minlength: 8
    },
    salt: {
      type: String,
      select: false // Don't include salt in queries by default
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Allow null/undefined values (for non-Google users)
    },
    profileImage: {
      type: String
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true // Allow null/undefined values
    }
  },
  { timestamps: true }
);

// Method to validate password
UserSchema.methods.validatePassword = function(password: string): boolean {
  if (!this.salt || !this.password) return false;
  
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  
  return this.password === hash;
};

// Pre-save hook to hash password
UserSchema.pre('save', function(next) {
  // Use unknown as intermediate type to avoid TypeScript errors
  const user = this as unknown as IUser;
  
  // Only hash the password if it's modified (or new)
  if (!user.isModified('password') || !user.password) return next();
  
  // Generate a salt
  const salt = crypto.randomBytes(16).toString('hex');
  user.salt = salt;
  
  // Hash the password using the salt
  const hash = crypto
    .pbkdf2Sync(user.password, salt, 1000, 64, 'sha512')
    .toString('hex');
  
  // Replace the plaintext password with the hash
  user.password = hash;
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
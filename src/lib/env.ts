// This file contains environment variables with defaults to allow for development without .env.local
// In production, these values should be set in environment variables

export const ENV = {
  // MongoDB connection string - default is a local MongoDB instance
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/solspore',
  
  // Fallback values for development
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Export default for use in other files
export default ENV; 
// Script to update a tournament image URL
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const tournamentId = '682467a6b63d6aab12ab5be0'; // The ID from the URL
const newImageUrl = 'https://storage.ensigame.com/logos/tournaments/cb53f268778f7a302da579a353f95b51.png';

// Read the .env.local file to get the MongoDB connection string
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUriMatch = envContent.match(/MONGODB_URI=(.+)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : 'mongodb://localhost:27017/solspore';

console.log('Using MongoDB URI:', MONGODB_URI);

async function updateTournamentImage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update the tournament directly in the collection
    const result = await mongoose.connection.collection('tournaments').updateOne(
      { _id: new mongoose.Types.ObjectId(tournamentId) },
      { $set: { image: newImageUrl } }
    );
    
    if (result.matchedCount === 0) {
      console.log('Tournament not found');
    } else if (result.modifiedCount === 0) {
      console.log('Tournament found but image not updated (may already have the same value)');
    } else {
      console.log('Tournament image updated successfully');
    }
  } catch (error) {
    console.error('Error updating tournament image:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
updateTournamentImage(); 
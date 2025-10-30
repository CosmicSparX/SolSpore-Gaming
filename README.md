# SolSpore Gaming Platform

A decentralized esports betting platform built on Solana, using Next.js and MongoDB.

## Features

- Esports tournaments with real-time betting markets
- Solana wallet integration for secure transactions
- Dynamic odds that adjust based on betting volumes
- Real-time data storage using MongoDB
- Responsive design with dark mode support

## Technologies

- Next.js 15.x
- TypeScript
- MongoDB/Mongoose
- Solana Web3.js
- Solana Wallet Adapter
- Tailwind CSS
- Framer Motion
- React Hot Toast

## Setup

### Prerequisites

- Node.js 18.x or higher
- NPM or Yarn
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/solspore.git
   cd solspore
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Setup:

   You have several options to set up your environment:

   **Option 1:** Run the interactive setup script (recommended):

   ```bash
   npm run setup
   ```

   **Option 2:** Create a default .env.local file:

   ```bash
   npm run create-env
   ```

   Then edit the .env.local file to add your MongoDB connection string.

   **Option 3:** Manually create a `.env.local` file in the root directory with these variables:

   ```
   MONGODB_URI=mongodb+srv://your-mongodb-connection-string
   NODE_ENV=development
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   JWT_SECRET=your_jwt_secret_key_here
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

   For local MongoDB development, you can use:

   ```
   MONGODB_URI=mongodb://localhost:27017/solspore
   ```

4. Test your MongoDB connection:

   ```bash
   npm run test-db
   ```

   This will verify that your MongoDB connection is working correctly.

### Database Setup

1. Seed the database with initial data:

   ```bash
   npm run seed
   ```

   This will populate your MongoDB database with sample tournaments and markets.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run the linter
- `npm run setup` - Interactive setup for .env.local file
- `npm run create-env` - Create a default .env.local file
- `npm run test-db` - Test the MongoDB connection
- `npm run seed` - Seed the database with initial data

## MongoDB Atlas Setup

If you want to use MongoDB Atlas instead of a local MongoDB instance:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient for development)
3. In the Security tab, create a database user with read/write permissions
4. In the Network Access tab, add your IP address to the IP whitelist
5. In the Database tab, click "Connect" and select "Connect your application"
6. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>` with your credentials and database name
7. Use this connection string in your `.env.local` file or when prompted by the setup script

## Google OAuth Setup

To enable Google Sign-In functionality:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add your application's domain to "Authorized JavaScript origins" (e.g., http://localhost:3000 for development)
7. Add your redirect URI to "Authorized redirect URIs" (e.g., http://localhost:3000/api/auth/google/callback)
8. Click "Create" and note your Client ID
9. Add the Client ID to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## API Routes

The application provides the following API endpoints:

- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get a specific tournament by ID
- `POST /api/tournaments` - Create a new tournament
- `POST /api/markets` - Create a new betting market
- `POST /api/markets/:id/bet` - Place a bet on a market

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

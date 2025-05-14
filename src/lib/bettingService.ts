'use client';

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import axios from 'axios';

export interface BetDetails {
  marketId: string; // Changed to string for MongoDB ObjectId
  outcome: 'yes' | 'no';
  amount: number; // in SOL
}

// This would typically be the program address for your betting platform
const BETTING_PROGRAM_ID = new PublicKey('8Qzv9MfGi6hre2fqBXbdZC1pDRvJMb6g3URADxNJbjQx'); // Replace with your actual program ID

// Example escrow account for the betting platform
const ESCROW_ACCOUNT = new PublicKey('8Qzv9MfGi6hre2fqBXbdZC1pDRvJMb6g3URADxNJbjQx'); // Replace with your actual escrow account

// In a real application, you'd fetch this from your backend
export const getClusterEndpoint = (): string => {
  return 'https://api.devnet.solana.com'; // Using devnet for testing
};

export const placeBet = async (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined,
  betDetails: BetDetails
): Promise<string> => {
  if (!publicKey) {
    throw new WalletNotConnectedError();
  }

  if (!signTransaction) {
    throw new Error('Wallet does not support transaction signing!');
  }

  try {
    const connection = new Connection(getClusterEndpoint(), 'confirmed');
  
    // Create a new transaction
    const transaction = new Transaction();
  
    // Convert SOL to lamports
    const lamports = betDetails.amount * LAMPORTS_PER_SOL;
  
    // For demonstration purposes, we're just using a simple transfer to the escrow account
    // In a real betting platform, you'd have a custom program instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: ESCROW_ACCOUNT,
        lamports,
      })
    );
  
    // Add a reference to the market and outcome (in a real app this would be part of program data)
    transaction.feePayer = publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);
    
    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    // Update the market in MongoDB
    await axios.post(`/api/markets/${betDetails.marketId}/bet`, {
      outcome: betDetails.outcome,
      amount: betDetails.amount,
    });
    
    // Return the transaction signature as confirmation
    return signature;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw new Error('Failed to place bet: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to get the user's SOL balance
export const getSolBalance = async (publicKey: PublicKey): Promise<number> => {
  const connection = new Connection(getClusterEndpoint(), 'confirmed');
  
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Function to fetch all tournaments
export const fetchTournaments = async () => {
  try {
    const response = await axios.get('/api/tournaments');
    return response.data.tournaments;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw new Error('Failed to fetch tournaments');
  }
};

// Function to fetch a specific tournament by ID
export const fetchTournamentById = async (tournamentId: string) => {
  try {
    const response = await axios.get(`/api/tournaments/${tournamentId}`);
    return response.data.tournament;
  } catch (error) {
    console.error(`Error fetching tournament ${tournamentId}:`, error);
    throw new Error('Failed to fetch tournament');
  }
}; 
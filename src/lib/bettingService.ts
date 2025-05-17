'use client';

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import axios from 'axios';
import { IBet } from '@/models/bet';

export interface BetDetails {
  marketId: string; // Changed to string for MongoDB ObjectId
  outcome: 'yes' | 'no';
  amount: number; // in SOL
  tournamentId: string; // Added for creating a bet record
}

// This would typically be the program address for your betting platform
const BETTING_PROGRAM_ID = new PublicKey('8Qzv9MfGi6hre2fqBXbdZC1pDRvJMb6g3URADxNJbjQx'); // Replace with your actual program ID

// Example escrow account for the betting platform
const ESCROW_ACCOUNT = new PublicKey('8Qzv9MfGi6hre2fqBXbdZC1pDRvJMb6g3URADxNJbjQx'); // Replace with your actual escrow account

// In a real application, you'd fetch this from your backend
export const getClusterEndpoint = (): string => {
  return 'https://api.devnet.solana.com'; // Using devnet for testing
};

// Deploy a smart contract for this bet that will handle the payout
const deployBetPayoutContract = async (
  connection: Connection,
  publicKey: PublicKey,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>),
  betDetails: BetDetails,
  marketOdds: number
): Promise<string> => {
  // In a real implementation, this would deploy a custom program or create a PDA
  // For this example, we'll simulate it by creating a new keypair 
  // that would represent the address of the deployed contract
  
  // Generate a new keypair for the contract
  const payoutContract = Keypair.generate();
  
  // In a real implementation, you would upload the program and initialize it
  // with bet details, outcome expectations, odds, etc.
  
  // For now, we'll return the public key as if we deployed a contract
  return payoutContract.publicKey.toString();
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
    
    // Get market details to get current odds
    const marketResponse = await axios.get(`/api/markets/${betDetails.marketId}`);
    const market = marketResponse.data.market;
    const odds = betDetails.outcome === 'yes' ? market.yesOdds : market.noOdds;
    
    // Deploy smart contract for this bet
    const smartContractAddress = await deployBetPayoutContract(
      connection,
      publicKey,
      signTransaction,
      betDetails,
      odds
    );
    
    // Update the market in MongoDB and create a bet record
    const response = await axios.post(`/api/markets/${betDetails.marketId}/bet`, {
      outcome: betDetails.outcome,
      amount: betDetails.amount,
      tournamentId: betDetails.tournamentId,
      transactionSignature: signature,
      odds: odds,
      smartContractAddress: smartContractAddress,
      walletAddress: publicKey.toString() // Include wallet address
    });
    
    // Return the transaction signature as confirmation
    return signature;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw new Error('Failed to place bet: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Get a user's SOL balance
export const getSolBalance = async (
  publicKey: PublicKey
): Promise<number> => {
  try {
    const connection = new Connection(getClusterEndpoint(), 'confirmed');
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to get balance: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Function to fetch user's bets
export const fetchUserBets = async (): Promise<any[]> => {
  try {
    const response = await axios.get('/api/bets');
    return response.data.bets;
  } catch (error) {
    console.error('Error fetching user bets:', error);
    throw new Error('Failed to fetch bets');
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
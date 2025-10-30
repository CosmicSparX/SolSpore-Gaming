import dbConnect from '@/lib/dbConnect';
import { Market } from '@/models/tournament';
import { Bet } from '@/models/bet';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// This would be your admin/platform wallet for performing settlements
let adminKeypair: Keypair;

// In a production environment, you would load this from a secure env variable
// For development, we'll look for a local keypair file
try {
  // Try loading from a local file for development
  const keyFile = fs.readFileSync(path.join(process.cwd(), 'admin-keypair.json'), 'utf-8');
  const secretKey = Uint8Array.from(JSON.parse(keyFile));
  adminKeypair = Keypair.fromSecretKey(secretKey);
} catch (error) {
  // For testing, generate a new keypair
  adminKeypair = Keypair.generate();
  console.log('Generated temporary admin keypair for testing. Public key:', adminKeypair.publicKey.toString());
}

// Solana connection with retry logic
const getConnection = (retries = 3): Connection => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Add ping method with retry for testing connection
  const pingWithRetry = async (remainingRetries = retries): Promise<boolean> => {
    try {
      const version = await connection.getVersion();
      console.log(`Connected to Solana ${version['solana-core']}`);
      return true;
    } catch (error) {
      if (remainingRetries > 0) {
        console.log(`Connection attempt failed, retrying... (${remainingRetries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return pingWithRetry(remainingRetries - 1);
      }
      console.error('Failed to connect to Solana network:', error);
      return false;
    }
  };
  
  // Just setup the connection now, we'll test it when needed
  return connection;
};

// Retry mechanism for database operations
async function withRetry<T>(
  operation: () => Promise<T>, 
  name: string,
  maxRetries = 3, 
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`${name} attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`${name} failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

// Settle a market with the given result
const settleMarket = async (marketId: string, result: 'yes' | 'no'): Promise<string> => {
  try {
    console.log(`Settling market ${marketId} with result: ${result}`);
    
    // 1. Update the market in the database
    const market = await withRetry(
      () => Market.findById(marketId),
      `Find market ${marketId}`,
      3
    );
    
    if (!market) {
      console.error(`Market not found: ${marketId}`);
      return '';
    }
    
    // Skip if already settled
    if (market.status === 'settled') {
      console.log(`Market ${marketId} already settled`);
      return market.settlementTxSignature || '';
    }
    
    // Update market status and result
    market.status = 'settled';
    market.result = result;
    
    // 2. Find all bets for this market
    const bets = await withRetry(
      () => Bet.find({ marketId, status: 'active' }),
      `Find bets for market ${marketId}`,
      3
    );
    
    console.log(`Found ${bets.length} active bets for market ${marketId}`);
    
    if (bets.length === 0) {
      console.log(`No active bets found for market ${marketId}, completing settlement`);
      
      // Even with no bets, still update the market status
      const settlementTxSignature = `settlement_no_bets_${Date.now()}`;
      market.settlementTxSignature = settlementTxSignature;
      await withRetry(
        () => market.save(),
        `Save market ${marketId} with no bets`,
        3
      );
      
      return settlementTxSignature;
    }
    
    // Establish connection to Solana
    const connection = getConnection();
    
    // 3. Trigger payout for each bet via its smart contract
    const settlements = await Promise.allSettled(bets.map(async (bet) => {
      try {
        // Check if this bet won
        const didWin = bet.outcome === result;
        
        // Calculate payout amount 
        const payout = didWin ? bet.stake * bet.odds : 0;
        
        console.log(`Bet ${bet._id}: Outcome=${bet.outcome}, Result=${result}, Won=${didWin}, Payout=${payout}`);
        
        // In a real implementation, you would call the actual smart contract here
        // For demo purposes, we'll simulate a transaction
        
        // Create a dummy transaction record
        let txSignature = '';
        
        if (bet.smartContractAddress && didWin) {
          // In a real implementation, call the smart contract to release funds
          // For the demo, we'll just log it
          console.log(`Would trigger payout via smart contract at ${bet.smartContractAddress}`);
          
          // For simulation purposes only - in reality you'd interact with the actual contract
          try {
            const transaction = new Transaction();
            // transaction.add(...instruction to call the payout contract);
            
            // In a real scenario, we'd sign and send the transaction
            // txSignature = await sendAndConfirmTransaction(connection, transaction, [adminKeypair]);
            txSignature = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          } catch (error) {
            console.error(`Error triggering payout for bet ${bet._id}:`, error);
            // Not returning here - we still want to update the bet status even if payout fails
            txSignature = '';
          }
        }
        
        // Update the bet status - we do this regardless of payout status
        bet.status = 'settled';
        bet.result = didWin ? 'win' : 'loss';
        bet.payout = payout;
        
        await withRetry(
          () => bet.save(),
          `Save bet ${bet._id} status update`,
          3
        );
        
        return { 
          betId: bet._id, 
          result: didWin ? 'win' : 'loss', 
          payout,
          success: true 
        };
      } catch (error) {
        console.error(`Error processing bet ${bet._id}:`, error);
        return { 
          betId: bet._id, 
          error: (error as Error).message,
          success: false 
        };
      }
    }));
    
    // Check results and log any failed settlements
    const successfulSettlements = settlements.filter(result => 
      result.status === 'fulfilled' && (result.value as any).success
    ).length;
    
    const failedSettlements = settlements.filter(result => 
      result.status === 'rejected' || !(result.value as any).success
    );
    
    if (failedSettlements.length > 0) {
      console.error(`${failedSettlements.length} bet settlements failed for market ${marketId}`);
      failedSettlements.forEach(failure => {
        if (failure.status === 'rejected') {
          console.error('  Rejection reason:', failure.reason);
        } else {
          console.error('  Failure reason:', (failure.value as any).error);
        }
      });
    }
    
    // 4. Record the settlement transaction in the market
    const settlementTxSignature = `settlement_${Date.now()}_${successfulSettlements}_of_${bets.length}`;
    market.settlementTxSignature = settlementTxSignature;
    
    await withRetry(
      () => market.save(),
      `Save market ${marketId} after settlement`,
      3
    );
    
    console.log(`Market ${marketId} settled successfully. ${successfulSettlements}/${bets.length} bets processed.`);
    return settlementTxSignature;
  } catch (error) {
    console.error(`Error settling market ${marketId}:`, error);
    // Don't rethrow - we want to continue processing other markets even if one fails
    return '';
  }
};

// Main function to find expired markets and settle them
const settleExpiredMarkets = async () => {
  let dbConnected = false;
  
  try {
    // Try connecting to the database with retry
    try {
      await withRetry(
        async () => { 
          await dbConnect();
          // Test the connection by running a simple query
          await Market.findOne({}).select('_id').exec();
        },
        "Database connection",
        5,
        2000
      );
      dbConnected = true;
    } catch (dbError) {
      console.error("Failed to connect to the database:", dbError);
      return; // Exit the function if we can't connect to the database
    }

    // Get current time
    const now = new Date();
    
    // Find all markets that are closed (past deadline) but not settled yet
    const expiredMarkets = await Market.find({
      status: 'open',
      closeTime: { $lt: now },
    });
    
    if (!expiredMarkets || expiredMarkets.length === 0) {
      console.log('No expired markets found to settle. Job completed.');
      return;
    }
    
    console.log(`Found ${expiredMarkets.length} expired markets to settle`);
    
    // Process each market
    const results = await Promise.allSettled(expiredMarkets.map(async (market) => {
      try {
        console.log(`Processing market: ${market._id} - ${market.question}`);
        
        // First mark the market as closed
        market.status = 'closed';
        await withRetry(
          () => market.save(),
          `Save market ${market._id} status as closed`,
          3
        );
        
        // In a real implementation, you'd determine the outcome based on real data sources
        // For this demo, we'll determine outcome based on stakes as a simple mechanism
        const result = market.yesStake >= market.noStake ? 'yes' : 'no';
        console.log(`Market outcome determined: ${result}`);
        
        // Settle the market with the determined result
        const settlementTx = await settleMarket(market._id.toString(), result);
        return { 
          marketId: market._id.toString(),
          question: market.question,
          result,
          settlementTx,
          success: !!settlementTx
        };
      } catch (error) {
        console.error(`Error processing market ${market._id}:`, error);
        return { 
          marketId: market._id.toString(), 
          question: market.question || 'Unknown',
          error: (error as Error).message,
          success: false 
        };
      }
    }));
    
    // Summarize results
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;
    
    console.log(`Settlement summary: ${successful} markets settled successfully, ${failed} failures`);
    
    if (failed > 0) {
      console.log('Failed markets:');
      results.forEach(result => {
        if (result.status === 'rejected' || !(result.value as any).success) {
          if (result.status === 'rejected') {
            console.log(`- Market settlement rejected: ${result.reason}`);
          } else {
            const value = result.value as any;
            console.log(`- Market ${value.marketId} (${value.question}) failed: ${value.error || 'Unknown error'}`);
          }
        }
      });
    }
    
    console.log('Market settlement completed');
  } catch (error) {
    console.error('Error in settleExpiredMarkets:', error);
  }
};

// If this script is run directly (not imported)
if (require.main === module) {
  settleExpiredMarkets()
    .then(() => {
      console.log('Settlement process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Settlement process failed:', error);
      process.exit(1);
    });
}

// Export for use in other scripts if needed
export { settleExpiredMarkets, settleMarket }; 
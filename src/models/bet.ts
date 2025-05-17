import mongoose, { Schema, Document } from 'mongoose';

export interface IBet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  outcome: 'yes' | 'no';
  stake: number;
  odds: number;
  timestamp: Date;
  status: 'active' | 'settled';
  result: 'win' | 'loss' | null;
  payout: number | null;
  transactionSignature: string;
  smartContractAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    marketId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Market', 
      required: true 
    },
    tournamentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Tournament', 
      required: true 
    },
    outcome: { 
      type: String, 
      enum: ['yes', 'no'], 
      required: true 
    },
    stake: { 
      type: Number, 
      required: true,
      min: 0 
    },
    odds: { 
      type: Number, 
      required: true,
      min: 1 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['active', 'settled'], 
      default: 'active' 
    },
    result: { 
      type: String, 
      enum: ['win', 'loss', null], 
      default: null 
    },
    payout: { 
      type: Number, 
      default: null 
    },
    transactionSignature: { 
      type: String, 
      required: true 
    },
    smartContractAddress: { 
      type: String, 
      default: null 
    }
  },
  { timestamps: true }
);

// Create compound index to ensure uniqueness and for performance
BetSchema.index({ userId: 1, marketId: 1 });

// Create index for efficient queries
BetSchema.index({ userId: 1, status: 1 });
BetSchema.index({ marketId: 1, status: 1 });

export const Bet = mongoose.models.Bet || mongoose.model<IBet>('Bet', BetSchema); 
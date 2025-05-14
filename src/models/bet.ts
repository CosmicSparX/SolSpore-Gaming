import mongoose, { Schema, Document } from 'mongoose';

export interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  amount: number;
  outcome: string;
  status: 'pending' | 'won' | 'lost' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema: Schema = new Schema({
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
  amount: {
    type: Number,
    required: true
  },
  outcome: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'canceled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
BetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Bet = mongoose.models.Bet || mongoose.model<IBet>('Bet', BetSchema); 
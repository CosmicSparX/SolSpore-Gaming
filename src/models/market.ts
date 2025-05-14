import mongoose, { Schema, Document } from 'mongoose';

// Market interface
export interface IMarket extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  teamA: string;
  teamB: string;
  closeTime: Date;
  yesOdds: number;
  noOdds: number;
  yesStake: number;
  noStake: number;
  createdAt: Date;
  updatedAt: Date;
}

// Market schema
const MarketSchema: Schema = new Schema(
  {
    question: { type: String, required: true },
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    closeTime: { type: Date, required: true },
    yesOdds: { type: Number, required: true, default: 2.0 },
    noOdds: { type: Number, required: true, default: 2.0 },
    yesStake: { type: Number, required: true, default: 0 },
    noStake: { type: Number, required: true, default: 0 },
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament' },
  },
  { timestamps: true }
);

// Export model (create it once if it doesn't exist)
export const Market = mongoose.models.Market || mongoose.model<IMarket>('Market', MarketSchema); 
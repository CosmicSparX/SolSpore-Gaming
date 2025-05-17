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
  status: 'open' | 'closed' | 'settled';
  result: 'yes' | 'no' | null;
  settlementTxSignature: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Tournament interface
export interface ITournament extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
  description: string;
  startDate: Date;
  endDate: Date;
  game: string;
  type: 'official' | 'custom';
  markets: mongoose.Types.ObjectId[] | IMarket[];
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
    status: { 
      type: String, 
      enum: ['open', 'closed', 'settled'], 
      default: 'open' 
    },
    result: { 
      type: String, 
      enum: ['yes', 'no', null], 
      default: null 
    },
    settlementTxSignature: { 
      type: String, 
      default: null 
    }
  },
  { timestamps: true }
);

// Tournament schema
const TournamentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    game: { type: String, required: true },
    type: { type: String, enum: ['official', 'custom'], default: 'official' },
    markets: [{ type: Schema.Types.ObjectId, ref: 'Market' }],
  },
  { timestamps: true }
);

// Export models (create them once if they don't exist)
export const Market = mongoose.models.Market || mongoose.model<IMarket>('Market', MarketSchema);
export const Tournament = mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema); 
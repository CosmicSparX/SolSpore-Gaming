import dbConnect from '@/lib/dbConnect';
import { Tournament, Market } from '@/models/tournament';

// Initial data for seeding
const seedData = async () => {
  try {
    await dbConnect();
    
    // Clear existing data
    await Tournament.deleteMany({});
    await Market.deleteMany({});
    
    console.log('Creating tournaments...');
    
    // Create tournaments
    const lolTournament = await Tournament.create({
      name: 'League of Legends LCS Spring',
      image: 'https://placehold.co/1200x400?text=LoL+LCS&font=roboto',
      description: 'The premier North American league for professional League of Legends players, featuring the top 10 teams competing for championship glory.',
      startDate: new Date('2025-05-15'),
      endDate: new Date('2025-06-10'),
      game: 'League of Legends',
      markets: [],
    });
    
    const dotaTournament = await Tournament.create({
      name: 'Dota 2 The International Qualifiers',
      image: 'https://placehold.co/1200x400?text=Dota+2+TI&font=roboto',
      description: 'Teams compete for the final spots in The International, the premier Dota 2 championship with the largest prize pool in esports.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-18'),
      game: 'Dota 2',
      markets: [],
    });
    
    console.log('Creating markets...');
    
    // Create markets for LoL tournament
    const lolMarkets = [
      {
        question: 'Will Team Liquid win against Cloud9?',
        teamA: 'Team Liquid',
        teamB: 'Cloud9',
        closeTime: new Date('2025-05-18T18:00:00Z'),
        yesOdds: 1.85,
        noOdds: 2.10,
        yesStake: 2540,
        noStake: 2240,
      },
      {
        question: 'Will 100 Thieves win against TSM?',
        teamA: '100 Thieves',
        teamB: 'TSM',
        closeTime: new Date('2025-05-18T20:00:00Z'),
        yesOdds: 2.25,
        noOdds: 1.75,
        yesStake: 1870,
        noStake: 2400,
      },
      {
        question: 'Will FlyQuest win against Evil Geniuses?',
        teamA: 'FlyQuest',
        teamB: 'Evil Geniuses',
        closeTime: new Date('2025-05-19T18:00:00Z'),
        yesOdds: 3.20,
        noOdds: 1.40,
        yesStake: 980,
        noStake: 2230,
      },
      {
        question: 'Will the total match time exceed 35 minutes for Dignitas vs. Golden Guardians?',
        teamA: 'Dignitas',
        teamB: 'Golden Guardians',
        closeTime: new Date('2025-05-19T20:00:00Z'),
        yesOdds: 1.90,
        noOdds: 2.00,
        yesStake: 1650,
        noStake: 1570,
      },
    ];
    
    // Create markets for Dota tournament
    const dotaMarkets = [
      {
        question: 'Will Team Secret win against Nigma Galaxy?',
        teamA: 'Team Secret',
        teamB: 'Nigma Galaxy',
        closeTime: new Date('2025-06-03T16:00:00Z'),
        yesOdds: 1.65,
        noOdds: 2.35,
        yesStake: 3240,
        noStake: 2260,
      },
      {
        question: 'Will OG win against Team Liquid?',
        teamA: 'OG',
        teamB: 'Team Liquid',
        closeTime: new Date('2025-06-03T19:00:00Z'),
        yesOdds: 2.10,
        noOdds: 1.80,
        yesStake: 1920,
        noStake: 2240,
      },
    ];
    
    // Add markets to LoL tournament
    for (const marketData of lolMarkets) {
      const market = await Market.create(marketData);
      lolTournament.markets.push(market._id);
    }
    await lolTournament.save();
    
    // Add markets to Dota tournament
    for (const marketData of dotaMarkets) {
      const market = await Market.create(marketData);
      dotaTournament.markets.push(market._id);
    }
    await dotaTournament.save();
    
    console.log('Seed data created successfully!');
    console.log(`Created ${await Tournament.countDocuments()} tournaments`);
    console.log(`Created ${await Market.countDocuments()} markets`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 
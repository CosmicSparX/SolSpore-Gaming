'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeftIcon, ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import BettingModal from '@/components/BettingModal'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { fetchTournamentById } from '@/lib/bettingService'
import axios from 'axios'

// Interface for Market
interface Market {
  _id: string;
  question: string;
  teamA: string;
  teamB: string;
  closeTime: string;
  yesOdds: number;
  noOdds: number;
  yesStake: number;
  noStake: number;
}

// Interface for Tournament
interface Tournament {
  _id: string;
  name: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  game: string;
  markets: Market[];
}

// Format date for display with consistent format regardless of environment
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Use explicit formatting to avoid locale differences
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

// Format time remaining until closing
const formatTimeRemaining = (closeTimeString: string) => {
  const closeTime = new Date(closeTimeString)
  const now = new Date()
  
  // Time difference in milliseconds
  const diff = closeTime.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'Closed'
  }
  
  // Convert to days, hours, minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

// Function to determine if a market is closing soon (within 1 hour)
const isClosingSoon = (closeTimeString: string) => {
  const closeTime = new Date(closeTimeString)
  const now = new Date()
  
  // Time difference in milliseconds
  const diff = closeTime.getTime() - now.getTime()
  
  // Return true if closing within 1 hour
  return diff > 0 && diff <= 60 * 60 * 1000
}

// Function to calculate new odds based on changing stakes
const calculateOdds = (yesStake: number, noStake: number) => {
  const totalStake = yesStake + noStake
  const baseOdds = 1.0
  
  // Ensure we don't divide by zero
  if (yesStake === 0) yesStake = 1
  if (noStake === 0) noStake = 1
  
  let yesOdds = baseOdds / (yesStake / totalStake)
  let noOdds = baseOdds / (noStake / totalStake)
  
  // Apply limits to odds
  yesOdds = Math.max(1.1, Math.min(10.0, yesOdds))
  noOdds = Math.max(1.1, Math.min(10.0, noOdds))
  
  // Round to 2 decimal places
  return {
    yesOdds: parseFloat(yesOdds.toFixed(2)),
    noOdds: parseFloat(noOdds.toFixed(2))
  }
}

export default function TournamentPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [markets, setMarkets] = useState<Market[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null)
  const [oddsChanges, setOddsChanges] = useState<{[key: string]: {yes: 'up' | 'down' | null, no: 'up' | 'down' | null}}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch tournament data from the API
  useEffect(() => {
    const loadTournament = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await axios.get(`/api/tournaments/${id}`);
          const tournamentData = response.data.tournament;
          
          // Check for invalid image URLs and replace with placeholder
          if (
            !tournamentData.image || 
            tournamentData.image.startsWith('blob:') ||
            tournamentData.image === 'undefined' || 
            tournamentData.image === 'null'
          ) {
            // Replace with placeholder
            tournamentData.image = `https://placehold.co/600x400/3b82f6/FFFFFF.png?text=${encodeURIComponent(tournamentData.name)}`;
          }
          
          setTournament(tournamentData);
          setMarkets(tournamentData.markets || []);
        }
      } catch (err) {
        console.error('Error loading tournament:', err);
        setError('Failed to load tournament. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTournament();
  }, [id]);
  
  // Simulate updating odds every 5 seconds based on market activity
  useEffect(() => {
    if (markets.length === 0) return;
    
    const interval = setInterval(() => {
      setMarkets(prevMarkets => {
        const newMarkets = prevMarkets.map(market => {
          // Randomly adjust one of the markets (to simulate real-time market activity)
            if (Math.random() < 0.3) {
            const yesChange = Math.floor(Math.random() * 100) - 50; // -50 to +50
            const noChange = Math.floor(Math.random() * 100) - 50; // -50 to +50
              
            const newYesStake = Math.max(100, market.yesStake + yesChange);
            const newNoStake = Math.max(100, market.noStake + noChange);
            
            // Calculate new odds based on stakes
            const newOdds = calculateOdds(newYesStake, newNoStake);
            
            // Track odds changes for animations
            setOddsChanges(prev => ({
              ...prev,
              [market._id]: {
                yes: newOdds.yesOdds > market.yesOdds ? 'up' : newOdds.yesOdds < market.yesOdds ? 'down' : null,
                no: newOdds.noOdds > market.noOdds ? 'up' : newOdds.noOdds < market.noOdds ? 'down' : null
              }
            }));
              
              return {
                ...market,
                yesStake: newYesStake,
                noStake: newNoStake,
                yesOdds: newOdds.yesOdds,
                noOdds: newOdds.noOdds
            };
            }
          return market;
        });
        
        return newMarkets;
      });
    }, 5000);
    
    // Reset odds change indicators after 1 second
    const resetInterval = setInterval(() => {
      setOddsChanges({});
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(resetInterval);
    };
  }, [markets]);
  
  const handleBetClick = (market: Market, outcome: 'yes' | 'no') => {
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setIsModalOpen(true);
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="text-xl font-medium">Loading tournament data...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error || !tournament) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-red-500 text-xl font-medium">{error || 'Tournament not found'}</div>
            <Link
              href="/tournaments"
              className="inline-flex items-center text-blue-500 hover:text-purple-500 transition-colors duration-300"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Back to All Tournaments
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-8">
          <Link 
            href="/tournaments" 
            className="inline-flex items-center text-blue-500 hover:text-purple-500 transition-colors duration-300"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to All Tournaments
          </Link>
        </div>
        
        {/* Tournament header */}
        <div className="relative rounded-xl overflow-hidden mb-10 shadow-lg">
          <div className="relative h-64 sm:h-80 bg-gradient-to-b from-blue-500 to-purple-600">
            {/* Handle all image types consistently */}
            {tournament.image && (
              <div
                style={{
                  backgroundImage: `url(${tournament.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  mixBlendMode: 'overlay'
                }}
                onError={() => {
                  // If the background image fails to load, replace it with a placeholder
                  // Note: this is just extra protection as we already check on data load
                  const target = document.getElementById('tournament-image-bg');
                  if (target) {
                    target.style.backgroundImage = `url(https://placehold.co/600x400/3b82f6/FFFFFF.png?text=${encodeURIComponent(tournament.name)})`;
                  }
                }}
                id="tournament-image-bg"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-block bg-purple-500 text-white px-3 py-1 text-sm rounded-md mb-3 font-medium">
                {tournament.game}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{tournament.name}</h1>
              <p className="text-gray-200">
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tournament description */}
        <div className="mb-12">
          <p className="text-lg">{tournament.description}</p>
          
          {/* Remove debug information */}
        </div>
        
        {/* Markets section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Betting Markets</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <InformationCircleIcon className="h-5 w-5" />
              <span>Odds update in real-time based on market activity</span>
            </div>
          </div>
          
          {markets.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">No betting markets available for this tournament yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {markets.map(market => {
                const isClosed = formatTimeRemaining(market.closeTime) === 'Closed';
                const isClosing = isClosingSoon(market.closeTime);
                const yesOddsChange = oddsChanges[market._id]?.yes;
                const noOddsChange = oddsChanges[market._id]?.no;
                
                return (
              <div 
                    key={market._id} 
                    className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {/* Market header with timing and teams */}
                    <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      {isClosing && !isClosed && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider animate-pulse">
                          Closing Soon
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold">{market.question}</h3>
                        <div className={`flex items-center ${isClosed ? 'text-red-500' : isClosing ? 'text-amber-500' : 'text-blue-500'}`}>
                          <ClockIcon className="h-5 w-5 mr-2" />
                          <span className="font-medium">{formatTimeRemaining(market.closeTime)}</span>
                  </div>
                </div>
                
                      <div className="mt-3 flex items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                            {market.teamA.charAt(0)}
                          </div>
                  <span className="font-semibold">{market.teamA}</span>
                        </div>
                        <div className="mx-3 text-gray-400">vs</div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                            {market.teamB.charAt(0)}
                          </div>
                  <span className="font-semibold">{market.teamB}</span>
                </div>
                      </div>
                    </div>
                    
                    {/* Betting options */}
                    <div className="p-6 pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Yes option */}
                        <div className={`relative rounded-xl overflow-hidden ${isClosed ? 'opacity-60' : ''}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-xl"></div>
                          <div className="relative p-5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="flex items-center font-semibold text-green-700 dark:text-green-400">
                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Yes
                              </span>
                              <div className="flex items-center">
                                {yesOddsChange && (
                                  <>
                                    {yesOddsChange === 'up' ? (
                                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                  </>
                                )}
                                <span className={`text-2xl font-bold ${yesOddsChange === 'up' ? 'text-green-500' : yesOddsChange === 'down' ? 'text-red-500' : ''}`}>
                                  {market.yesOdds.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                    <button
                      onClick={() => handleBetClick(market, 'yes')}
                              disabled={isClosed}
                              className={`
                                w-full py-3 px-4 rounded-lg font-semibold text-white 
                                ${isClosed 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:translate-y-[-2px] transition-all duration-300 shadow-md hover:shadow-lg'
                                }
                              `}
                    >
                              {isClosed ? 'Market Closed' : 'Place Bet on Yes'}
                    </button>
                          </div>
                  </div>
                  
                        {/* No option */}
                        <div className={`relative rounded-xl overflow-hidden ${isClosed ? 'opacity-60' : ''}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-xl"></div>
                          <div className="relative p-5">
                            <div className="flex justify-between items-center mb-4">
                              <span className="flex items-center font-semibold text-red-700 dark:text-red-400">
                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                No
                              </span>
                              <div className="flex items-center">
                                {noOddsChange && (
                                  <>
                                    {noOddsChange === 'up' ? (
                                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                  </>
                                )}
                                <span className={`text-2xl font-bold ${noOddsChange === 'up' ? 'text-green-500' : noOddsChange === 'down' ? 'text-red-500' : ''}`}>
                                  {market.noOdds.toFixed(2)}
                                </span>
                              </div>
                    </div>
                            
                    <button
                      onClick={() => handleBetClick(market, 'no')}
                              disabled={isClosed}
                              className={`
                                w-full py-3 px-4 rounded-lg font-semibold text-white 
                                ${isClosed 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:translate-y-[-2px] transition-all duration-300 shadow-md hover:shadow-lg'
                                }
                              `}
                    >
                              {isClosed ? 'Market Closed' : 'Place Bet on No'}
                    </button>
                  </div>
                </div>
              </div>
                      
                      {/* Market stats */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Total staked on Yes:</span> 
                            <span className="ml-1 font-medium">{market.yesStake.toLocaleString()} SOL</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Total staked on No:</span> 
                            <span className="ml-1 font-medium">{market.noStake.toLocaleString()} SOL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          )}
        </div>
        
        {/* Betting Modal */}
        {selectedMarket && (
          <BettingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            market={{
              id: selectedMarket._id,
              question: selectedMarket.question,
              teamA: selectedMarket.teamA,
              teamB: selectedMarket.teamB,
              yesOdds: selectedMarket.yesOdds,
              noOdds: selectedMarket.noOdds
            }}
            outcome={selectedOutcome}
            tournamentId={params.id as string}
          />
        )}
      </div>
      <Footer />
    </>
  )
} 
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock data for user bets
const userBets = [
  {
    id: 1001,
    tournamentId: 1,
    tournamentName: 'League of Legends LCS Spring',
    marketId: 101,
    question: 'Will Team Liquid win against Cloud9?',
    teamA: 'Team Liquid',
    teamB: 'Cloud9',
    outcome: 'yes',
    odds: 1.85,
    stake: 2.5,
    betDate: '2025-05-16T14:30:00Z',
    marketCloseTime: '2025-05-18T18:00:00Z',
    status: 'settled',
    result: 'win',
    payout: 4.63
  },
  {
    id: 1002,
    tournamentId: 1,
    tournamentName: 'League of Legends LCS Spring',
    marketId: 102,
    question: 'Will 100 Thieves win against TSM?',
    teamA: '100 Thieves',
    teamB: 'TSM',
    outcome: 'no',
    odds: 1.75,
    stake: 1.0,
    betDate: '2025-05-16T16:45:00Z',
    marketCloseTime: '2025-05-18T20:00:00Z',
    status: 'settled',
    result: 'loss',
    payout: 0
  },
  {
    id: 1003,
    tournamentId: 2,
    tournamentName: 'Dota 2 The International Qualifiers',
    marketId: 201,
    question: 'Will Team Secret win against Nigma Galaxy?',
    teamA: 'Team Secret',
    teamB: 'Nigma Galaxy',
    outcome: 'yes',
    odds: 1.68,
    stake: 3.0,
    betDate: '2025-06-02T10:15:00Z',
    marketCloseTime: '2025-06-03T16:00:00Z',
    status: 'active',
    result: null,
    payout: null
  }
]

// Format date for display with consistent format regardless of environment
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Use explicit formatting to avoid locale differences
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Format time consistently
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
}

export default function MyBetsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all')
  
  // Filter bets based on current filter
  const filteredBets = userBets.filter(bet => {
    if (filter === 'all') return true
    if (filter === 'active') return bet.status === 'active'
    if (filter === 'settled') return bet.status === 'settled'
    return true
  })
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-500 hover:text-purple-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">My Bets</h1>
          <p className="text-lg">
            Track all your current and past bets on the SolSpore Gaming platform.
          </p>
        </div>
        
        {/* Filter controls */}
        <div className="flex mb-6">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                filter === 'all'
                  ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              All Bets
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'active'
                  ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border-t border-b border-gray-300 dark:border-gray-600`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('settled')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                filter === 'settled'
                  ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              Settled
            </button>
          </div>
        </div>
        
        {/* Bets List */}
        <div className="space-y-6">
          {filteredBets.length > 0 ? (
            filteredBets.map((bet) => (
              <div 
                key={bet.id}
                className="card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <Link
                      href={`/tournaments/${bet.tournamentId}`}
                      className="text-blue-500 hover:text-purple-500 text-sm"
                    >
                      {bet.tournamentName}
                    </Link>
                    <h3 className="text-xl font-bold mt-1">{bet.question}</h3>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {bet.status === 'settled' ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        bet.result === 'win' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {bet.result === 'win' ? (
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 mr-1" />
                        )}
                        {bet.result === 'win' ? 'Won' : 'Lost'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="font-medium">{bet.teamA}</span>
                  <span>vs</span>
                  <span className="font-medium">{bet.teamB}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Your Prediction</p>
                    <p className="font-medium">
                      {bet.outcome === 'yes' ? 'Yes' : 'No'}
                      <span className="ml-2 text-gray-500 dark:text-gray-400">@ {bet.odds.toFixed(2)}</span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Stake</p>
                    <p className="font-medium">{bet.stake.toFixed(2)} SOL</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Potential/Actual Payout</p>
                    <p className="font-medium">
                      {bet.status === 'active' 
                        ? `${(bet.stake * bet.odds).toFixed(2)} SOL`
                        : bet.result === 'win'
                          ? `${bet.payout?.toFixed(2)} SOL`
                          : '0.00 SOL'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Bet Placed On</p>
                    <p className="font-medium">{formatDate(bet.betDate)}</p>
                  </div>
                </div>
                
                {/* Only show for active bets */}
                {bet.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm">
                      Market closes on {formatDate(bet.marketCloseTime)}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No bets found matching your filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
} 
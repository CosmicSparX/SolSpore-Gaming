'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { fetchUserBets } from '@/lib/bettingService'
import { toast } from 'react-hot-toast'

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function MyBetsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all')
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const { publicKey, connected } = useWallet()
  
  // Fetch user bets when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      const loadBets = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch(`/api/bets?walletAddress=${walletAddress}`);
          
          if (!response.ok) {
            // For server errors (5xx), just show empty bets instead of an error
            if (response.status >= 500) {
              console.error('Server error when fetching bets:', response.status);
              setBets([]);
              return;
            }
            
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch bets data');
          }
          
          const data = await response.json();
          
          if (data.success) {
            setBets(data.bets || []);
          } else if (data.message && !data.error) {
            // If the API says no bets found, just show empty state without error
            console.log('API message:', data.message);
            setBets([]);
          } else {
            console.error('API returned error:', data.error || data.message);
            // Don't set error for simple "no bets" scenarios
            if (data.error && !data.error.includes('No bets')) {
              setError(data.error);
            }
            setBets([]);
          }
        } catch (error) {
          console.error('Error loading bets:', error);
          // Don't show technical errors to users, just show empty bets
          setBets([]);
        } finally {
          setLoading(false);
        }
      };
      
      loadBets();
    } else {
      setBets([]);
      setLoading(false);
    }
  }, [connected, publicKey]);
  
  // Filter bets based on current filter
  const filteredBets = bets.filter(bet => {
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
        
        {/* Connect wallet prompt if not connected */}
        {!connected && (
          <div className="card p-12 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
              Please connect your wallet to view your bets.
            </p>
            <WalletMultiButton className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg py-3 px-6 text-white font-medium shadow hover:shadow-purple-500/20 transform hover:translate-y-[-2px] transition-all duration-300">
              Connect Wallet
            </WalletMultiButton>
          </div>
        )}
        
        {/* Loading state */}
        {connected && loading && (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg">Loading your bets...</p>
            </div>
          </div>
        )}
        
        {/* Error state - only show for actual errors, not empty bets */}
        {connected && !loading && error && (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Something went wrong</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Content when connected, loaded, and no error */}
        {connected && !loading && !error && (
          <>
            {/* Filter controls - only show if there are bets */}
            {bets.length > 0 && (
              <div className="mb-6">
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border border-gray-300 dark:border-gray-600`}
                  >
                    All Bets
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 text-sm font-medium ${
                      filter === 'active'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border-t border-b border-gray-300 dark:border-gray-600`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter('settled')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      filter === 'settled'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border border-gray-300 dark:border-gray-600`}
                  >
                    Settled
                  </button>
                </div>
              </div>
            )}
            
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
                    
                    {/* Transaction details */}
                    {bet.transactionSignature && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <details className="text-xs">
                          <summary className="text-blue-500 cursor-pointer">Transaction Details</summary>
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                            <p className="mb-1">Transaction Signature:</p>
                            <a 
                              href={`https://explorer.solana.com/tx/${bet.transactionSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 break-all"
                            >
                              {bet.transactionSignature}
                            </a>
                            
                            {bet.smartContractAddress && (
                              <>
                                <p className="mt-2 mb-1">Smart Contract:</p>
                                <a 
                                  href={`https://explorer.solana.com/address/${bet.smartContractAddress}?cluster=devnet`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 break-all"
                                >
                                  {bet.smartContractAddress}
                                </a>
                              </>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <svg 
                    className="h-16 w-16 mx-auto mb-4 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No bets found
                  </p>
                  <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                    {filter !== 'all' 
                      ? `You don't have any ${filter} bets.` 
                      : "You haven't placed any bets yet."}
                  </p>
                  <Link 
                    href="/tournaments" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow hover:shadow-purple-500/20 transform hover:translate-y-[-2px] transition-all duration-300"
                  >
                    Browse Tournaments
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

interface LeaderboardUser {
  userId: string
  username: string
  walletAddress: string
  profileImage: string
  totalBets: number
  winningBets: number
  winRate: number
  totalWinnings: number
  rank: number
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  })
  
  const fetchLeaderboard = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/leaderboard?page=${page}&limit=20`)
      
      if (!response.ok) {
        // For server errors (5xx), just show no data available instead of an error
        if (response.status >= 500) {
          console.error('Server error when fetching leaderboard:', response.status)
          setUsers([])
          setPagination({
            total: 0,
            page: 1,
            limit: 20,
            pages: 0
          })
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch leaderboard data')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.leaderboard || [])
        setPagination(data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0
        })
      } else if (data.error === 'No users found' || data.message === 'No users found') {
        // If the API explicitly says no users found, just show empty state
        setUsers([])
        setPagination({
          total: 0,
          page: 1,
          limit: 20,
          pages: 0
        })
      } else {
        throw new Error(data.error || 'Failed to load leaderboard')
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      // Don't show technical errors to users, just set empty state
      setUsers([])
      setPagination({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Load leaderboard on page load
  useEffect(() => {
    fetchLeaderboard()
  }, [])
  
  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return
    fetchLeaderboard(page)
  }
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }
  
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
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-lg">
            Top players ranked by total winnings on the SolSpore platform.
          </p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg">Loading leaderboard data...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {!loading && error && (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Failed to load leaderboard</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button 
                onClick={() => fetchLeaderboard()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* No Users State */}
        {!loading && !error && users.length === 0 && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No leaderboard data available
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">
              Be the first to join the leaderboard by placing winning bets!
            </p>
            <Link 
              href="/tournaments" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow hover:shadow-purple-500/20 transform hover:translate-y-[-2px] transition-all duration-300"
            >
              Browse Tournaments
            </Link>
          </div>
        )}
        
        {/* Leaderboard Table */}
        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full card">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Bets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Winnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr 
                    key={user.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Show special styling for top 3 */}
                      {user.rank <= 3 ? (
                        <span className={`
                          flex items-center justify-center w-8 h-8 rounded-full font-bold text-white
                          ${user.rank === 1 ? 'bg-yellow-500' : user.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                        `}>
                          {user.rank}
                        </span>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {user.rank}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                            src={user.profileImage || '/images/default-avatar.png'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatWalletAddress(user.walletAddress)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {user.winRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.winningBets} / {user.totalBets} bets
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.totalBets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {user.totalWinnings.toFixed(2)} SOL
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-md ${
                  pagination.page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              {/* First page */}
              {pagination.page > 2 && (
                <button
                  onClick={() => goToPage(1)}
                  className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  1
                </button>
              )}
              
              {/* Ellipsis */}
              {pagination.page > 3 && (
                <span className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
              )}
              
              {/* Page before current */}
              {pagination.page > 1 && (
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {pagination.page - 1}
                </button>
              )}
              
              {/* Current page */}
              <button
                className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white font-medium"
              >
                {pagination.page}
              </button>
              
              {/* Page after current */}
              {pagination.page < pagination.pages && (
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {pagination.page + 1}
                </button>
              )}
              
              {/* Ellipsis */}
              {pagination.page < pagination.pages - 2 && (
                <span className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
              )}
              
              {/* Last page */}
              {pagination.page < pagination.pages - 1 && (
                <button
                  onClick={() => goToPage(pagination.pages)}
                  className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {pagination.pages}
                </button>
              )}
              
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`p-2 rounded-md ${
                  pagination.page === pagination.pages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, ChevronRightIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import axios from 'axios'

interface Tournament {
  _id: string
  name: string
  image: string
  description: string
  startDate: string
  endDate: string
  game: string
  type: 'official' | 'custom'
  marketsCount?: number
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official')
  
  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true)
      try {
        // Load tournaments without type filter first to get all tournaments
        const response = await axios.get('/api/tournaments')
        const tournamentsData = response.data.tournaments
        
        // Add marketsCount for each tournament
        const processedTournaments = tournamentsData.map((tournament: any) => ({
          ...tournament,
          marketsCount: tournament.markets ? tournament.markets.length : 0,
          type: tournament.type || 'official' // Default to official for backward compatibility
        }))
        
        setTournaments(processedTournaments)
      } catch (err) {
        console.error('Error loading tournaments:', err)
        setError('Failed to load tournaments. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
  
    loadTournaments()
  }, [])
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Filter tournaments based on type
  const filteredTournaments = tournaments.filter(
    tournament => tournament.type === activeTab
  )

  // Count tournaments by type
  const officialCount = tournaments.filter(t => t.type === 'official').length
  const communityCount = tournaments.filter(t => t.type === 'custom').length

  return (
    <>
      <Navbar />
      
      {/* Hero section with tournament type selector */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-blue-100 mb-8 max-w-2xl">
            Browse and bet on your favorite esports tournaments
          </p>
          
          {/* Tournament Type Tab Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-4">
            <button
              onClick={() => setActiveTab('official')}
              className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                activeTab === 'official'
                  ? 'bg-white dark:bg-gray-800 shadow-lg transform -translate-y-1'
                  : 'bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-800/40'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                activeTab === 'official'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-white/20 text-white'
              }`}>
                <TrophyIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${
                  activeTab === 'official' ? 'text-blue-600 dark:text-blue-400' : 'text-white'
                }`}>
                  Official Tournaments
                </h3>
                <p className={activeTab === 'official' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-100'}>
                  Platform-verified tournaments with {officialCount} available
                </p>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-gray-800 shadow-lg transform -translate-y-1'
                  : 'bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-800/40'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                activeTab === 'custom'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-white/20 text-white'
              }`}>
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${
                  activeTab === 'custom' ? 'text-green-600 dark:text-green-400' : 'text-white'
                }`}>
                  Community Tournaments
                </h3>
                <p className={activeTab === 'custom' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-100'}>
                  User-created tournaments with {communityCount} available
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">
              No {activeTab} tournaments available at the moment.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === 'official' ? 'Official' : 'Community'} Tournaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <Link
                  key={tournament._id}
                  href={`/tournaments/${tournament._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48">
                    <Image
                      src={tournament.image}
                      alt={tournament.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tournament.type === 'official' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {tournament.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                      {tournament.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {tournament.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>
                          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-blue-500">
                        {tournament.marketsCount} Markets
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-md">
                        {tournament.game}
                      </span>
                      <span className="text-blue-500 flex items-center text-sm font-medium">
                        View Details <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  )
} 
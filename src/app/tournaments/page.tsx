'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
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
  marketsCount?: number
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/tournaments')
        const tournamentsData = response.data.tournaments
        
        // Add marketsCount for each tournament
        const processedTournaments = tournamentsData.map((tournament: any) => ({
          ...tournament,
          marketsCount: tournament.markets ? tournament.markets.length : 0
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Available Tournaments</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          Browse and bet on your favorite esports tournaments
        </p>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">No tournaments available at the moment.</p>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
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
        )}
      </div>
      <Footer />
    </>
  )
} 
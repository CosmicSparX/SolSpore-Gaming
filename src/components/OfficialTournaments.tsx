'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import axios from 'axios'

// Interface for tournament data
interface Tournament {
  _id: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  game: string;
  markets: any[];
}

// Format date for display with consistent format regardless of environment
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Use explicit formatting to avoid locale differences
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

// Calculate days remaining for a tournament
const daysRemaining = (dateString: string) => {
  const today = new Date()
  const endDate = new Date(dateString)
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export default function OfficialTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('/api/tournaments');
        setTournaments(response.data.tournaments.slice(0, 4)); // Only get the first 4 tournaments
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments');
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <section>
        <div className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Official Esports Tournaments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card dark:card-dark animate-pulse">
              <div className="h-40 bg-gray-700"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-700 rounded"></div>
                  <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="mb-10 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Official Esports Tournaments</h2>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-10 flex justify-between items-center">
        <h2 className="text-3xl font-bold">Official Esports Tournaments</h2>
        <Link 
          href="/tournaments" 
          className="text-blue-500 hover:text-purple-500 flex items-center gap-2"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tournaments.map((tournament) => (
          <motion.div 
            key={tournament._id}
            className="card dark:card-dark hover:shadow-xl overflow-hidden transition-all duration-300 hover:scale-105"
            variants={item}
          >
            <div className="relative h-40 bg-gradient-to-b from-blue-400 to-purple-600">
              <Image
                src={tournament.image}
                alt={tournament.name}
                fill
                className="object-cover mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block bg-purple-500 text-white px-2 py-1 text-xs rounded-md font-medium">
                  {tournament.game}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 truncate">{tournament.name}</h3>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                <span>
                  Starts: {formatDate(tournament.startDate)}
                </span>
                <span className="text-red-500 font-semibold">
                  {daysRemaining(tournament.startDate)} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {tournament.markets.length} markets
                </span>
                <Link 
                  href={`/tournaments/${tournament._id}`}
                  className="text-white bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Bet Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
} 
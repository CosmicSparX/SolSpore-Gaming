'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import Link from 'next/link'
import Image from 'next/image'

// Simulating data that would come from an API
interface StatsData {
  totalBets: number;
  activeMarkets: number;
  totalWagered: number;
}

export default function Hero() {
  const [stats, setStats] = useState<StatsData>({
    totalBets: 0,
    activeMarkets: 0,
    totalWagered: 0
  });
  const [loading, setLoading] = useState(true);

  // Simulate API call to fetch data
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // This would be replaced with a real API call
        // const response = await fetch('/api/stats');
        // const data = await response.json();
        
        // Simulating API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for testing phase
        const mockData: StatsData = {
          totalBets: 32,
          activeMarkets: 8,
          totalWagered: 5.6
        };
        
        setStats(mockData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback to default values in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Main hero background with animated gradient */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-indigo-900/40 animate-gradient-slow" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Content container */}
      <div className="relative py-20 sm:py-32 px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center">
          {/* Main hero content */}
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            >
            {/* Tag line */}
            <motion.div 
              className="mb-6 inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-xs font-semibold tracking-wider text-purple-200 uppercase">
                The Future of Esports Betting is Here
              </span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 animate-text pb-1 leading-tight">
                SolSpore Gaming
              </span>
            </h1>
            
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-6 text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Bet on the Future of Esports
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-300 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Experience dynamic odds betting on your favorite esports events using Solana blockchain technology. 
              Fast, secure, and transparent – backed by the speed and security of the Solana network.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                href="/tournaments"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white rounded-xl 
                  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                  shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30
                  transform hover:translate-y-[-2px] transition-all duration-300"
              >
                Browse Tournaments
              </Link>
              <Link 
                href="/faq" 
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white rounded-xl 
                  bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm
                  border border-gray-700/50 hover:border-gray-600
                  transform hover:translate-y-[-2px] transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
            
            {/* Powered by Solana */}
            <motion.div
              className="inline-flex items-center justify-center px-4 py-2 rounded-full 
                bg-gray-800/30 backdrop-blur-sm border border-gray-700/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <span className="text-sm text-gray-300 flex items-center gap-2">
                Powered by 
                <span className="flex items-center">
                  <Image 
                    src="/images/solana-logo.png"
                    alt="Solana Logo"
                    width={18}
                    height={18}
                    className="rounded-full mr-1"
                  />
                  <span className="font-semibold text-purple-300">Solana Protocol</span>
                </span>
              </span>
            </motion.div>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <div className="relative backdrop-blur-lg overflow-hidden group">
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-800/40"></div>
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border border-purple-500/20 rounded-xl"></div>
              
              {/* Card content */}
              <div className="relative p-8">
                <div className="absolute top-3 right-3 text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md font-medium border border-amber-500/30">
                  Beta
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-300">Total Bets Placed</p>
                </div>
                
                {loading ? (
                  <div className="mt-2 h-9 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    <CountUp end={stats.totalBets} separator="," duration={2.5} />
              </p>
                )}
              </div>
            </div>
            
            <div className="relative backdrop-blur-lg overflow-hidden group">
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-indigo-800/40"></div>
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border border-blue-500/20 rounded-xl"></div>
              
              {/* Card content */}
              <div className="relative p-8">
                <div className="absolute top-3 right-3 text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md font-medium border border-amber-500/30">
                  Beta
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-300">Active Markets</p>
                </div>
                
                {loading ? (
                  <div className="mt-2 h-9 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    <CountUp end={stats.activeMarkets} duration={2.5} />
              </p>
                )}
              </div>
            </div>
            
            <div className="relative backdrop-blur-lg overflow-hidden group">
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-800/40"></div>
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border border-indigo-500/20 rounded-xl"></div>
              
              {/* Card content */}
              <div className="relative p-8">
                <div className="absolute top-3 right-3 text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-md font-medium border border-amber-500/30">
                  Beta
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-300">Total SOL Wagered</p>
                </div>
                
                {loading ? (
                  <div className="mt-2 h-9 w-24 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    <CountUp end={stats.totalWagered} decimals={1} duration={2.5} /> SOL
              </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Testing disclaimer */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <span className="inline-flex items-center text-xs text-gray-400 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
              <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Currently in beta testing phase. Live data will be available at launch.
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 
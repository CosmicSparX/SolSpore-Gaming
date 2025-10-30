'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CustomTournaments() {
  return (
    <section>
      <div className="mb-10">
        <h2 className="text-3xl font-bold">Custom Tournaments</h2>
      </div>

      <motion.div 
        className="rounded-2xl overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-solspore-dark/90 border border-solspore-purple/30 rounded-2xl overflow-hidden p-8 sm:p-12 text-center">
          <div className="absolute top-0 left-0 right-0 h-2 bg-solspore-gradient"></div>
          
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              <span className="gradient-text">Custom Tournaments</span> Coming Soon
            </h3>
            
            <p className="text-gray-300 text-lg mb-8">
              Soon you'll be able to create your own custom betting markets for any esports event. 
              Set your own questions, determine outcomes, and invite friends to participate.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-solspore-teal/20">
                <h4 className="text-solspore-teal font-bold mb-2">Create & Customize</h4>
                <p className="text-gray-400">Create custom markets for any event with your own rules and parameters</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-solspore-blue/20">
                <h4 className="text-solspore-blue font-bold mb-2">Invite Friends</h4>
                <p className="text-gray-400">Share your markets with friends and build your own betting community</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-solspore-purple/20">
                <h4 className="text-solspore-purple font-bold mb-2">Earn Rewards</h4>
                <p className="text-gray-400">Earn platform tokens for creating popular markets and driving engagement</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-solspore-dark hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solspore-purple transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Notified When Available
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="mt-8 text-gray-400 text-sm">
              Expected launch: Q3 2025
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
} 
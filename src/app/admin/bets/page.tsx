'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Bet {
  _id: string;
  userId: string;
  username: string;
  marketId: string;
  marketName: string;
  tournamentId: string;
  tournamentName: string;
  amount: number;
  outcome: string;
  status: 'pending' | 'won' | 'lost' | 'canceled';
  createdAt: string;
}

export default function AdminBets() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch bets
  const fetchBets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/bets${filter !== 'all' ? `?status=${filter}` : ''}`);
      setBets(response.data.bets);
    } catch (error: any) {
      console.error('Error fetching bets:', error);
      toast.error(error.response?.data?.error || 'Failed to load bets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [filter]);

  // Update bet status
  const updateBetStatus = async (betId: string, status: 'won' | 'lost' | 'canceled') => {
    try {
      await axios.put(`/api/admin/bets/${betId}`, { status });
      toast.success(`Bet marked as ${status}`);
      fetchBets(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating bet:', error);
      toast.error(error.response?.data?.error || 'Failed to update bet');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'won':
        return 'bg-green-900 text-green-200';
      case 'lost':
        return 'bg-red-900 text-red-200';
      case 'canceled':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Bets</h1>
        <Link 
          href="/admin" 
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('won')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'won' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Won
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'lost' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => setFilter('canceled')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'canceled' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Canceled
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tournament / Market
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Bet Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {bets.length > 0 ? (
                  bets.map((bet) => (
                    <tr key={bet._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {bet.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{bet.tournamentName}</div>
                          <div className="text-xs text-gray-400">{bet.marketName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-white">{bet.outcome}</div>
                          <div className="text-xs text-gray-400">{bet.amount} SOL</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(bet.status)}`}>
                          {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {bet.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBetStatus(bet._id, 'won')}
                                className="text-green-400 hover:text-green-300"
                                title="Mark as Won"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateBetStatus(bet._id, 'lost')}
                                className="text-red-400 hover:text-red-300"
                                title="Mark as Lost"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateBetStatus(bet._id, 'canceled')}
                                className="text-gray-400 hover:text-gray-300"
                                title="Cancel Bet"
                              >
                                <ClockIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <Link 
                            href={`/tournaments/${bet.tournamentId}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      No bets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
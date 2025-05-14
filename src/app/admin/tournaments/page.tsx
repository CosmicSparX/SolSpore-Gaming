'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TrophyIcon, PencilIcon, TrashIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Tournament {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  marketCount: number;
}

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tournaments
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/tournaments');
      setTournaments(response.data.tournaments);
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      toast.error(error.response?.data?.error || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Delete tournament
  const deleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This will also delete all associated markets and bets.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/tournaments/${tournamentId}`);
      toast.success('Tournament deleted successfully');
      fetchTournaments(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      toast.error(error.response?.data?.error || 'Failed to delete tournament');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-900 text-blue-200';
      case 'active':
        return 'bg-green-900 text-green-200';
      case 'completed':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Tournaments</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin" 
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/admin/tournaments/new" 
            className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Tournament
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/6"></div>
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
                    Tournament
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Markets
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tournaments.length > 0 ? (
                  tournaments.map((tournament) => (
                    <tr key={tournament._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <TrophyIcon className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{tournament.name}</div>
                            <div className="text-xs text-gray-400 max-w-xs truncate">
                              {tournament.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          {new Date(tournament.startDate).toLocaleDateString()} - 
                          {new Date(tournament.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(tournament.status)}`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {tournament.marketCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/tournaments/${tournament._id}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/admin/tournaments/${tournament._id}/edit`}
                            className="text-green-400 hover:text-green-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => deleteTournament(tournament._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      No tournaments found
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
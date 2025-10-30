'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { 
  ArrowPathIcon,
  PencilSquareIcon, 
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  TrophyIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Tournament {
  _id: string;
  name: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  game: string;
  type: 'official' | 'custom';
  markets: any[];
  createdAt: string;
}

export default function TournamentsManagementPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'official' | 'custom'>('all');
  
  // Fetch all tournaments
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tournaments');
      setTournaments(response.data.tournaments);
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
      // Fallback dummy data for development/preview
      setTournaments([
        {
          _id: '1',
          name: 'Valorant Championship',
          image: 'https://placehold.co/600x400/3b82f6/FFFFFF.png?text=Valorant+Championship',
          description: 'The biggest Valorant tournament of the year',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          game: 'Valorant',
          type: 'official',
          markets: [],
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'League of Legends World Cup',
          image: 'https://placehold.co/600x400/8b5cf6/FFFFFF.png?text=LoL+World+Cup',
          description: 'Annual League of Legends competition',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          game: 'League of Legends',
          type: 'official',
          markets: [],
          createdAt: new Date().toISOString(),
        },
        {
          _id: '3',
          name: 'CS:GO Amateur League',
          image: 'https://placehold.co/600x400/ec4899/FFFFFF.png?text=CS:GO+Amateur',
          description: 'Community tournament for CS:GO enthusiasts',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          game: 'CS:GO',
          type: 'custom',
          markets: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTournaments();
    }
  }, [user]);
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle opening delete modal
  const handleDeleteClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsDeleteModalOpen(true);
  };
  
  // Handle deleting a tournament
  const handleDelete = async () => {
    if (!selectedTournament) return;
    
    try {
      await axios.delete(`/api/tournaments/${selectedTournament._id}`);
      
      // Remove the tournament from the list
      setTournaments(tournaments.filter(t => t._id !== selectedTournament._id));
      
      toast.success('Tournament deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      toast.error(error.response?.data?.error || 'Failed to delete tournament');
      
      // For development/preview, remove the tournament from the list directly
      if (process.env.NODE_ENV === 'development') {
        setTournaments(tournaments.filter(t => t._id !== selectedTournament._id));
        setIsDeleteModalOpen(false);
        toast.success('Tournament deleted (preview mode)');
      }
    }
  };
  
  // Filter tournaments based on type
  const filteredTournaments = typeFilter === 'all' 
    ? tournaments 
    : tournaments.filter(tournament => tournament.type === typeFilter);
  
  // Check if the authenticated user is an admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-500/10 p-3 rounded-full mb-4">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Admin Access Required</h1>
        <p className="text-gray-400 text-center mb-6 max-w-md">
          You need to be logged in as an administrator to access this page.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
          >
            Login
          </Link>
          <Link 
            href="/" 
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tournament Management</h1>
          <p className="text-gray-400 mt-2">
            Create, edit and delete tournaments
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-gray-800 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`py-2 px-3 rounded-lg transition-all duration-200 ${
                typeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('official')}
              className={`py-2 px-3 rounded-lg transition-all duration-200 ${
                typeFilter === 'official' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Official
            </button>
            <button
              onClick={() => setTypeFilter('custom')}
              className={`py-2 px-3 rounded-lg transition-all duration-200 ${
                typeFilter === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Custom
            </button>
          </div>
          <button
            onClick={fetchTournaments}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <Link
            href="/admin/tournaments/new"
            className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Tournament
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <TrophyIcon className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Tournaments Found</h3>
          <p className="text-gray-400 mb-6">
            {typeFilter === 'all' 
              ? 'There are no tournaments to display.' 
              : `There are no ${typeFilter} tournaments to display.`}
          </p>
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament._id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              <div className="relative h-40">
                <Image
                  src={tournament.image}
                  alt={tournament.name}
                  fill
                  className="object-cover"
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
                <h2 className="text-xl font-bold text-white mb-2">
                  {tournament.name}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {tournament.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>
                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span>
                    {tournament.markets.length} markets
                  </span>
                </div>
                <div className="border-t border-gray-800 pt-4 mt-2 flex justify-between">
                  <Link
                    href={`/admin/tournaments/${tournament._id}`}
                    className="text-blue-400 hover:text-blue-300 flex items-center text-sm font-medium"
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(tournament)}
                    className="text-red-400 hover:text-red-300 flex items-center text-sm font-medium"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the tournament <span className="font-semibold">{selectedTournament.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Tournament
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
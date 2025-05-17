'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Market {
  _id: string;
  question: string;
  teamA: string;
  teamB: string;
  closeTime: string;
  yesOdds: number;
  noOdds: number;
}

interface Tournament {
  _id: string;
  name: string;
  image: string;
  description: string;
  startDate: string;
  endDate: string;
  game: string;
  type: 'official' | 'custom';
  markets: Market[];
}

// Properly type params according to NextJS 14 requirements
export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // No need to unwrap params since it's no longer a Promise or union type
  const tournamentId = params.id;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMarketModalOpen, setIsAddMarketModalOpen] = useState(false);
  const [isDeleteMarketModalOpen, setIsDeleteMarketModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  
  const [marketForm, setMarketForm] = useState({
    question: '',
    teamA: '',
    teamB: '',
    closeTime: '',
    yesOdds: 2.0,
    noOdds: 2.0
  });

  // Fetch tournament data
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tournaments/${tournamentId}`);
        setTournament(response.data.tournament);
      } catch (error: any) {
        console.error('Error fetching tournament:', error);
        toast.error('Failed to load tournament details');
        
        // Fallback data for development/preview
        if (process.env.NODE_ENV === 'development') {
          const today = new Date();
          const endDate = new Date();
          endDate.setDate(today.getDate() + 7);
          
          setTournament({
            _id: tournamentId,
            name: 'Sample Tournament',
            image: 'https://placehold.co/600x400/3b82f6/FFFFFF.png?text=Tournament',
            description: 'This is a sample tournament for development',
            startDate: today.toISOString(),
            endDate: endDate.toISOString(),
            game: 'Sample Game',
            type: 'official',
            markets: []
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchTournament();
    }
  }, [tournamentId, user]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle market form input changes
  const handleMarketInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMarketForm({
      ...marketForm,
      [name]: name === 'yesOdds' || name === 'noOdds' ? parseFloat(value) : value
    });
  };

  // Handle adding a new market
  const handleAddMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tournament) return;
    
    try {
      const response = await axios.post(`/api/tournaments/${tournamentId}/markets`, marketForm);
      
      // Update tournament with new market
      setTournament({
        ...tournament,
        markets: [...tournament.markets, response.data.market]
      });
      
      toast.success('Market added successfully');
      setIsAddMarketModalOpen(false);
      
      // Reset form
      setMarketForm({
        question: '',
        teamA: '',
        teamB: '',
        closeTime: '',
        yesOdds: 2.0,
        noOdds: 2.0
      });
    } catch (error: any) {
      console.error('Error adding market:', error);
      toast.error(error.response?.data?.error || 'Failed to add market');
      
      // For development/preview
      if (process.env.NODE_ENV === 'development') {
        const newMarket = {
          _id: `temp-${Date.now()}`,
          ...marketForm,
          closeTime: new Date(marketForm.closeTime).toISOString(),
        };
        
        setTournament({
          ...tournament,
          markets: [...tournament.markets, newMarket as any]
        });
        
        setIsAddMarketModalOpen(false);
        toast.success('Market added (preview mode)');
        
        // Reset form
        setMarketForm({
          question: '',
          teamA: '',
          teamB: '',
          closeTime: '',
          yesOdds: 2.0,
          noOdds: 2.0
        });
      }
    }
  };

  // Handle opening delete market modal
  const handleDeleteMarketClick = (market: Market) => {
    setSelectedMarket(market);
    setIsDeleteMarketModalOpen(true);
  };

  // Handle deleting a market
  const handleDeleteMarket = async () => {
    if (!tournament || !selectedMarket) return;
    
    try {
      await axios.delete(`/api/tournaments/${tournamentId}/markets/${selectedMarket._id}`);
      
      // Update tournament markets list
      setTournament({
        ...tournament,
        markets: tournament.markets.filter(m => m._id !== selectedMarket._id)
      });
      
      toast.success('Market deleted successfully');
      setIsDeleteMarketModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting market:', error);
      toast.error(error.response?.data?.error || 'Failed to delete market');
      
      // For development/preview
      if (process.env.NODE_ENV === 'development') {
        setTournament({
          ...tournament,
          markets: tournament.markets.filter(m => m._id !== selectedMarket._id)
        });
        
        setIsDeleteMarketModalOpen(false);
        toast.success('Market deleted (preview mode)');
      }
    }
  };

  // Set a default close time for a new market (24 hours from now)
  const getDefaultCloseTime = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
        <h3 className="text-lg font-medium text-white mb-2">Tournament Not Found</h3>
        <p className="text-gray-400 mb-6">
          The tournament you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Return to Tournament List
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center">
        <Link 
          href="/admin/tournaments" 
          className="mr-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
          <p className="text-gray-400 mt-2">
            Manage tournament details and markets
          </p>
        </div>
      </div>

      {/* Tournament Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-48">
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
              <h2 className="text-xl font-bold text-white mb-3">{tournament.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <div>
                  <div>Start: {formatDate(tournament.startDate)}</div>
                  <div>End: {formatDate(tournament.endDate)}</div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-md">
                  {tournament.game}
                </span>
                <Link
                  href={`/admin/tournaments/edit/${tournament._id}`}
                  className="text-blue-400 hover:text-blue-300 flex items-center text-sm font-medium"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                  Edit Tournament
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Markets section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-5 flex justify-between items-center border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Markets</h2>
              <button
                onClick={() => setIsAddMarketModalOpen(true)}
                className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Market
              </button>
            </div>
            
            {tournament.markets && tournament.markets.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {tournament.markets.map((market) => (
                  <div key={market._id} className="p-5">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg">{market.question}</h3>
                      <button
                        onClick={() => handleDeleteMarketClick(market)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Team A</div>
                        <div className="text-white">{market.teamA}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Team B</div>
                        <div className="text-white">{market.teamB}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Close Time</div>
                        <div className="text-white">{formatDate(market.closeTime)}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Yes Odds</div>
                        <div className="text-green-400 font-semibold">{market.yesOdds}x</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">No Odds</div>
                        <div className="text-red-400 font-semibold">{market.noOdds}x</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 mb-4">No markets have been created for this tournament yet.</p>
                <button
                  onClick={() => setIsAddMarketModalOpen(true)}
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create First Market
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Market Modal */}
      {isAddMarketModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Market</h2>
              <button 
                onClick={() => setIsAddMarketModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddMarket}>
              <div className="mb-4">
                <label htmlFor="question" className="block text-sm font-medium text-gray-400 mb-1">
                  Question/Title*
                </label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={marketForm.question}
                  onChange={handleMarketInputChange}
                  placeholder="e.g. Will Team A win against Team B?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="teamA" className="block text-sm font-medium text-gray-400 mb-1">
                    Team A*
                  </label>
                  <input
                    type="text"
                    id="teamA"
                    name="teamA"
                    value={marketForm.teamA}
                    onChange={handleMarketInputChange}
                    placeholder="e.g. Cloud9"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="teamB" className="block text-sm font-medium text-gray-400 mb-1">
                    Team B*
                  </label>
                  <input
                    type="text"
                    id="teamB"
                    name="teamB"
                    value={marketForm.teamB}
                    onChange={handleMarketInputChange}
                    placeholder="e.g. Fnatic"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="closeTime" className="block text-sm font-medium text-gray-400 mb-1">
                  Market Close Time*
                </label>
                <input
                  type="datetime-local"
                  id="closeTime"
                  name="closeTime"
                  value={marketForm.closeTime || getDefaultCloseTime()}
                  onChange={handleMarketInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The time when betting will close for this market.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="yesOdds" className="block text-sm font-medium text-gray-400 mb-1">
                    Yes Odds*
                  </label>
                  <input
                    type="number"
                    id="yesOdds"
                    name="yesOdds"
                    value={marketForm.yesOdds}
                    onChange={handleMarketInputChange}
                    min="1.01"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="noOdds" className="block text-sm font-medium text-gray-400 mb-1">
                    No Odds*
                  </label>
                  <input
                    type="number"
                    id="noOdds"
                    name="noOdds"
                    value={marketForm.noOdds}
                    onChange={handleMarketInputChange}
                    min="1.01"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddMarketModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Market Confirmation Modal */}
      {isDeleteMarketModalOpen && selectedMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the market <span className="font-semibold">{selectedMarket.question}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteMarketModalOpen(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMarket}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Market
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
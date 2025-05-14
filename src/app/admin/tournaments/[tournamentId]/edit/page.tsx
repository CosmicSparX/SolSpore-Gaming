'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TournamentProps {
  params: {
    tournamentId: string;
  };
}

export default function EditTournament({ params }: TournamentProps) {
  const { tournamentId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    image: '',
    status: 'upcoming'
  });

  // Fetch tournament data
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/tournaments/${tournamentId}`);
        const tournament = response.data.tournament;
        
        // Format dates for datetime-local input
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };
        
        setFormData({
          name: tournament.name,
          description: tournament.description || '',
          startDate: formatDate(tournament.startDate),
          endDate: formatDate(tournament.endDate),
          image: tournament.image || '',
          status: tournament.status
        });
      } catch (error: any) {
        console.error('Error fetching tournament:', error);
        toast.error(error.response?.data?.error || 'Failed to load tournament');
        router.push('/admin/tournaments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournament();
  }, [tournamentId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await axios.put(`/api/admin/tournaments/${tournamentId}`, formData);
      toast.success('Tournament updated successfully');
      router.push('/admin/tournaments');
    } catch (error: any) {
      console.error('Error updating tournament:', error);
      toast.error(error.response?.data?.error || 'Failed to update tournament');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Tournament</h1>
        <Link 
          href="/admin/tournaments" 
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          Back to Tournaments
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-800 rounded w-1/3"></div>
            <div className="h-20 bg-gray-800 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-10 bg-gray-800 rounded w-full"></div>
              <div className="h-10 bg-gray-800 rounded w-full"></div>
            </div>
            <div className="h-10 bg-gray-800 rounded w-full"></div>
            <div className="h-10 bg-gray-800 rounded w-1/4"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Tournament Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tournament name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tournament description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date*
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                  End Date*
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 ${
                  saving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <Link
                href="/admin/tournaments"
                className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.error('You must be logged in to view this page');
      router.push('/');
    } else if (user) {
      // Initialize form with user data
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    
    try {
      setUpdating(true);
      
      // This would be implemented in a real API endpoint
      // await axios.put('/api/user/profile', { username, email });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-700 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-purple-600">
                {user.profileImage ? (
                  <Image 
                    src={user.profileImage}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 text-white px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setUsername(user.username);
                          setEmail(user.email);
                        }}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                    <p className="text-gray-400 mt-1">{user.email}</p>
                    <p className="text-gray-300 mt-4">
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </p>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 bg-gray-950 p-8">
            <h2 className="text-xl font-semibold text-white mb-4">Account Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Total Bets</h3>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Tournaments Joined</h3>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-gray-400 text-sm">Win Rate</h3>
                <p className="text-white text-2xl font-bold">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 
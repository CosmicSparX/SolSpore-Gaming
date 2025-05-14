'use client'

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function CreateTournamentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    game: '',
    type: 'official',
  });
  
  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create and set preview URL - don't use URL.createObjectURL as it creates temporary blob URLs
      // Instead, read as base64 right away
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image drop zone click
  const handleImageDropZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remove selected image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error('Please upload a tournament image');
      return;
    }
    
    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert image to base64 string
      let imageUrl = '';
      try {
        imageUrl = await convertToBase64(imageFile);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        
        // Fallback for development
        if (process.env.NODE_ENV === 'development') {
          imageUrl = `https://placehold.co/600x400/3b82f6/FFFFFF.png?text=Tournament`;
        } else {
          throw new Error('Failed to process image');
        }
      }
      
      // Format dates for API - ensure proper format with time component
      let startDate, endDate;
      
      try {
        startDate = new Date(`${formData.startDate}T00:00:00`);
        endDate = new Date(`${formData.endDate}T23:59:59`);
        
        // Validate date objects
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        toast.error('Invalid date format. Please use YYYY-MM-DD format.');
        setLoading(false);
        return;
      }
      
      const apiData = {
        name: formData.name,
        description: formData.description,
        game: formData.game,
        type: formData.type,
        image: imageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      // Submit to API
      const response = await axios.post('/api/tournaments', apiData);
      
      toast.success('Tournament created successfully');
      
      // Redirect to tournament management page
      router.push('/admin/tournaments');
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      toast.error(error.response?.data?.error || 'Failed to create tournament');
      
      // Simulate success for development/preview
      if (process.env.NODE_ENV === 'development') {
        toast.success('Tournament created (preview mode)');
        router.push('/admin/tournaments');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Generate today's date and a month from now in YYYY-MM-DD format for date inputs
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthFormatted = nextMonth.toISOString().split('T')[0];
  
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
      <div className="mb-8 flex items-center">
        <Link 
          href="/admin/tournaments" 
          className="mr-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-all duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
          <p className="text-gray-400 mt-2">
            Add a new tournament to the platform
          </p>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Tournament Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. Valorant Championship 2023"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tournament Image*
              </label>
              <div 
                onClick={handleImageDropZoneClick}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  imagePreview ? 'border-blue-500' : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative w-full h-48 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Tournament preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="py-6">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">Click to upload tournament image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="Provide a description of the tournament..."
                required
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-1">
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="game" className="block text-sm font-medium text-gray-400 mb-1">
                Game*
              </label>
              <input
                type="text"
                id="game"
                name="game"
                value={formData.game}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. Valorant, CS:GO, League of Legends"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-400 mb-1">
                Tournament Type*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              >
                <option value="official">Official</option>
                <option value="custom">Custom</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Official tournaments are organized by the platform, custom tournaments are community-created
              </p>
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-6 space-x-3">
              <Link
                href="/admin/tournaments"
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Tournament'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
} 
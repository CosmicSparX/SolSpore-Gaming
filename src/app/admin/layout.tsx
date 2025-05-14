'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only redirect if we've finished loading and the user is not an admin
    if (!loading) {
      if (!user) {
        toast.error('You must be logged in to access this page');
        router.push('/');
      } else if (user.role !== 'admin') {
        toast.error('You do not have permission to access this page');
        router.push('/');
      } else {
        // User is admin, mark auth as checked
        setHasCheckedAuth(true);
      }
    }
  }, [user, loading, router]);

  // If loading or haven't checked auth yet, show loading state
  if (loading || !hasCheckedAuth) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse flex flex-col space-y-4">
              <div className="h-10 bg-gray-700 rounded w-1/4"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If we reach here, user is authenticated as admin
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
} 
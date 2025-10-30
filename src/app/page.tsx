'use client'

import React from 'react'
import Hero from '@/components/Hero'
import OfficialTournaments from '@/components/OfficialTournaments'
import CustomTournaments from '@/components/CustomTournaments'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
        <Hero />
      <div className="container mx-auto px-4 md:px-8">
        <div className="mt-20 md:mt-24">
          <OfficialTournaments />
        </div>
        <div className="mt-20 md:mt-24 mb-20 md:mb-24">
          <CustomTournaments />
        </div>
      </div>
      <Footer />
    </>
  )
} 
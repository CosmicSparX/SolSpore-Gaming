import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { WalletContextProvider } from '@/context/WalletContextProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { metadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link href="https://sol-spore.vercel.app/" hreflang="x-default" rel="alternate" />

        <link href="https://hi.sol-spore.vercel.app/" hreflang="hi" rel="alternate" />

        <script src="https://script-cdn.multilipi.com/static/JS/page_translations.js" multilipi-key="23eb36b7-b662-4a8b-82be-9b11f27674e8" mode="auto" data-pos-x="50" data-pos-y="50" crossorigin="anonymous" defer>
        </script>
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
        <AuthProvider>
          <WalletContextProvider>
            <div className="min-h-screen flex flex-col">
              {/* Navbar will be imported in each page */}
              <main className="flex-grow pt-16">
                {children}
              </main>
              {/* Footer will be imported in each page */}
            </div>
            <Toaster position="bottom-right" />
          </WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 

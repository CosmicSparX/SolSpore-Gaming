import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import { WalletContextProvider } from '@/context/WalletContextProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { metadata } from './metadata'
import Script from 'next/script'

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

        <script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js" />
        <Script id="weglot-init" strategy="beforeInteractive">
          {`
            Weglot.initialize({
              api_key: 'wg_ef05ffbfa9d4c4e66a86f8968d65bcf26'
            });
          `}
        </Script>
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
    </html >
  )
} 

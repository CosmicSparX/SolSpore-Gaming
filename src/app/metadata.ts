import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SolSpore Gaming',
  description: 'Solana-based esports betting platform',
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png', sizes: '180x180' }
    ],
  },
  manifest: '/favicons/site.webmanifest',
} 
import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'

const sans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SaltCity Leadership',
  description: 'Pastoral operations companion for SaltCity church leadership',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SaltCity' },
}

export const viewport: Viewport = {
  themeColor: '#6B2540',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased">{children}</body>
    </html>
  )
}

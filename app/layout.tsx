import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import SiteHeader from '@/components/SiteHeader'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'ISE Exhibitor Invitation Generator',
    template: '%s | ISE Exhibitor Tool',
  },
  description:
    'Generate exhibitor invitation assets for ISE 2026 including PNG, PDF, and marketing packs.',
  keywords: [
    'ISE 2026',
    'Exhibitor',
    'Invitation Generator',
    'ISE Europe',
    'Barcelona',
    'AV Exhibition',
  ],
  openGraph: {
    title: 'ISE Exhibitor Invitation Generator',
    description: 'Create and export exhibitor invitations for ISE 2026.',
    url: 'https://iseurope.org',
    siteName: 'ISE Exhibitor Tool',
    type: 'website',
  },
  metadataBase: new URL('https://iseurope.org'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#090909_45%,_#000_100%)]">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  )
}
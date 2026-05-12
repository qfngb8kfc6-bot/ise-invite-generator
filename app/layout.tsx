import type { Metadata, Viewport } from 'next'
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://invitations.iseurope.org'
  ),
  title: {
    default: 'ISE 2027 Exhibitor Invitation Generator',
    template: '%s | ISE 2027 Exhibitor Platform',
  },
  description:
    'Create official ISE 2027 exhibitor invitation assets including PNG, PDF, ZIP marketing packs, launch links, and exhibitor analytics.',
  applicationName: 'ISE Exhibitor Invitation Generator',
  appleWebApp: {
    capable: true,
    title: 'ISE Invites',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'ISE 2027 Exhibitor Invitation Generator',
    description:
      'Official exhibitor invitation asset generator and analytics platform for ISE 2027.',
    type: 'website',
    siteName: 'ISE 2027 Exhibitor Platform',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white antialiased selection:bg-white selection:text-black`}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,#020202_0%,#050505_45%,#000_100%)]" />
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}

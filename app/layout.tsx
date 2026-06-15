import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Geist_Mono } from 'next/font/google'
import SiteHeader from '@/components/SiteHeader'
import './globals.css'

const avantGarde = localFont({
  src: [
    {
      path: '../public/fonts/avant-garde-gothic-pro-book.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/avant-garde-gothic-pro-medium-oblique.otf',
      weight: '500',
      style: 'italic',
    },
  ],
  variable: '--font-avant-garde',
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
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
        className={`${avantGarde.className} ${avantGarde.variable} ${geistMono.variable} min-h-screen bg-[#020617] text-white antialiased selection:bg-white selection:text-black`}
      >
        <div className="fixed inset-0 -z-20 bg-[#020617]" />
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/branding/ise-background.jpeg')",
          }}
        />
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.68)_42%,rgba(2,6,23,0.28)_100%)]" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(45,63,143,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_34%)]" />
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}

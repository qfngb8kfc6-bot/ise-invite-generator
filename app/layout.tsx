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
  title: 'ISE 2027 Exhibitor Invitation Generator',
  description:
    'Create official ISE 2027 exhibitor invitation assets including PNG, PDF, and marketing packs.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
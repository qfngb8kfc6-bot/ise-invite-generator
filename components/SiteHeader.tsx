'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function SiteHeader() {
  const pathname = usePathname()

  const isTools = pathname.startsWith('/tools')
  const isReports = pathname.startsWith('/reports')
  const isGenerator = pathname.startsWith('/generator')

  let title = 'ISE 2027'
  let subtitle = ''

  if (isGenerator) {
    title = 'ISE 2027 Invitation Generator'
  }

  if (isTools) {
    title = 'ISE 2027 Exhibitor Tools'
    subtitle = 'Invitation Generator'
  }

  if (isReports) {
    title = 'ISE 2027 Exhibitor Reports'
    subtitle = 'Analytics Dashboard'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-3">
          
          {/* LOGO */}
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
            <Image
              src="/ise-logo.png"
              alt="ISE Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div>
            <div className="text-sm font-semibold leading-none text-white">
              {title}
            </div>

            {subtitle && (
              <div className="mt-1 text-xs text-neutral-500">
                {subtitle}
              </div>
            )}
          </div>
        </Link>

        {(isTools || isReports) && (
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/tools"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              Tools
            </Link>

            <Link
              href="/reports"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              Reports
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
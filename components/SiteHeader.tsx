import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
            ISE
          </div>

          <div>
            <div className="text-sm font-semibold leading-none text-white">
              ISE Exhibitor Platform
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Invitation Generator
            </div>
          </div>
        </Link>

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
      </div>
    </header>
  )
}
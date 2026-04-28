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
              ISE 2026 Exhibitor Tools
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Invitation Generator
            </div>
          </div>
        </Link>

        <div className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 sm:inline-flex">
          Official Exhibitor Access
        </div>
      </div>
    </header>
  )
}
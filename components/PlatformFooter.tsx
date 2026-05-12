export default function PlatformFooter() {
  const year = process.env.NEXT_PUBLIC_EVENT_YEAR?.trim() || '2027'

  return (
    <footer className="border-t border-white/10 bg-black/60 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium text-neutral-300">
            ISE {year} Exhibitor Invitation Platform
          </div>
          <div className="mt-1">
            Official invitation assets, launch links, and exhibitor analytics.
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            PNG
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            PDF
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            ZIP Pack
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            Analytics
          </span>
        </div>
      </div>
    </footer>
  )
}

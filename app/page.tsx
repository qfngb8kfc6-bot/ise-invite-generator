import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex h-[calc(100vh-128px)] items-center overflow-hidden px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
          ISE 2027 Exhibitor Platform
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl">
          Create official exhibitor invitation assets.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
          Generate branded invitation cards, QR codes, PDFs and social assets for ISE exhibitors.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/admin/login?redirect=/reports"
            className="min-w-[220px] rounded-2xl border border-white/10 bg-white px-10 py-4 text-center text-base font-semibold text-black transition hover:bg-blue-50"
          >
            Admin login
          </Link>
        </div>

        <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/46 p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-3xl font-semibold">QR</div>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Create scannable registration links for exhibitors and visitors.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/46 p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-3xl font-semibold">MYS</div>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Pull exhibitor information, stand numbers and invitation codes.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/46 p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-3xl font-semibold">Exports</div>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Export invitation cards as PNG, PDF and ZIP asset packs.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

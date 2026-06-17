import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'

const cards = [
  {
    title: 'Generator',
    href: '/generator',
    description: 'Create branded exhibitor invitation assets, QR codes, PDF exports and ZIP packs.',
    label: 'Open generator',
  },
  {
    title: 'Tools',
    href: '/tools',
    description: 'Generate secure launch links and test exhibitor access before EBO integration.',
    label: 'Open tools',
  },
  {
    title: 'Reports',
    href: '/reports',
    description: 'Track usage, exports, QR scans, funnel activity and exhibitor performance.',
    label: 'View reports',
  },
]

export default async function HomePage() {
  const cookieStore = await cookies()
  const isAdmin = await verifyAdminSessionCookieValue(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!isAdmin) {
    redirect('/admin/login?redirect=/')
  }
  return (
    <main className="min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <section className="grid gap-8 rounded-[36px] border border-white/10 bg-black/46 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <div className="inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
              ISE 2027 Exhibitor Platform
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl">
              Create invitation assets and track exhibitor engagement.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              A branded ISE tool for exhibitor invitation cards, secure launch links,
              QR tracking, exports and usage reporting.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/generator"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-blue-50"
              >
                Open generator
              </Link>

              <Link
                href="/reports"
                className="rounded-2xl border border-white/10 bg-black/46 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                View reports
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-[#101827]/80 p-6">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-white/40">
                Live modules
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/46 p-4">
                  <div className="text-3xl font-semibold">QR</div>
                  <div className="mt-1 text-sm text-white/50">
                    Scan tracking via /r/[id]
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/46 p-4">
                  <div className="text-3xl font-semibold">MYS</div>
                  <div className="mt-1 text-sm text-white/50">
                    Exhibitor data and invitation URLs
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/46 p-4">
                  <div className="text-3xl font-semibold">Reports</div>
                  <div className="mt-1 text-sm text-white/50">
                    Usage, exports and exhibitor analytics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-[28px] border border-white/10 bg-black/46 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-black/56"
            >
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/55">
                {card.description}
              </p>
              <div className="mt-5 text-sm font-semibold text-blue-200 group-hover:underline">
                {card.label} →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}

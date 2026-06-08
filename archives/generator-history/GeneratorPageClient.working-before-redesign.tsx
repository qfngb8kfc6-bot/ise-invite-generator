'use client'

import InvitePreview from '@/components/InvitePreview'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { themes } from '@/lib/themes'
import type { LanguageKey, ThemeKey } from '@/lib/types'

type Props = {
  initialToken?: string
}

export default function GeneratorPageClient({ initialToken }: Props) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* LEFT PANEL */}
        <section className="w-full border-r border-white/10 bg-white/[0.03] backdrop-blur-2xl xl:w-[460px]">
          <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="border-b border-white/10 px-8 py-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  ISE 2027
                </div>

                <LanguageSwitcher dark />
              </div>

              <h1 className="max-w-[320px] text-4xl font-semibold leading-tight tracking-tight">
                Exhibitor Invitation Generator
              </h1>

              <p className="mt-4 text-sm leading-7 text-neutral-400">
                Create premium invitation assets, QR exports, and marketing packs
                for exhibitors in real time.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                LIVE EXPORT ENGINE READY
              </div>
            </div>

            {/* FORM */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div className="space-y-8">
                {/* BRAND SECTION */}
                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Brand Details</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Configure exhibitor information and branding.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-300">
                        Company Name
                      </label>

                      <input
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-blue-400/40 focus:bg-black/40"
                        placeholder="Samsung"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-300">
                          Stand Number
                        </label>

                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-blue-400/40"
                          placeholder="5C300"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-300">
                          Invite Code
                        </label>

                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-blue-400/40"
                          placeholder="ISE2027"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-300">
                        Registration URL
                      </label>

                      <input
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-blue-400/40"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </section>

                {/* THEMES */}
                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Visual Theme</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Select an invitation design sector.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left transition hover:scale-[1.02] hover:border-blue-400/30"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 transition duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${theme.backgroundImage})`,
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />

                        <div className="relative p-6">
                          <div className="text-xl font-semibold">
                            {theme.label}
                          </div>

                          <div className="mt-2 text-sm text-neutral-400">
                            Premium {theme.label.toLowerCase()} invitation
                            experience
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* EXPORT DOCK */}
            <div className="border-t border-white/10 bg-black/30 p-6 backdrop-blur-2xl">
              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-blue-600 px-5 py-4 font-medium transition hover:bg-blue-500">
                  Export PNG
                </button>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium transition hover:bg-white/10">
                  Export PDF
                </button>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium transition hover:bg-white/10">
                  LinkedIn
                </button>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-medium transition hover:bg-white/10">
                  ZIP Pack
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="relative hidden flex-1 items-center justify-center overflow-hidden xl:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

          <div className="relative scale-[0.82] transition duration-700 hover:scale-[0.84]">
            <div className="absolute inset-0 rounded-[40px] bg-blue-500/20 blur-3xl" />

            <div className="relative">
              <InvitePreview
                companyName="Samsung"
                standNumber="5C300"
                invitationCode="ISE2027"
                logoUrl=""
                registrationUrl="https://registration.example.com"
                theme={'audio' as ThemeKey}
                language={'en' as LanguageKey}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
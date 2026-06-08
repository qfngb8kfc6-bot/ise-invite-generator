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
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12%] top-[-15%] h-[620px] w-[620px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[720px] w-[720px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent_35%,rgba(0,0,0,0.45))]" />
      </div>

      <div className="relative z-10 grid min-h-screen xl:grid-cols-[430px_1fr]">
        <section className="border-r border-white/10 bg-[#050816]/95 backdrop-blur-2xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.9)]" />
                  ISE 2027
                </div>

                <LanguageSwitcher dark />
              </div>

              <h1 className="max-w-[340px] text-4xl font-semibold leading-[1.03] tracking-tight">
                Exhibitor Invitation Generator
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">
                Create polished invitation assets, QR exports, and marketing packs for exhibitors in real time.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live export engine ready
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <div className="space-y-8">
                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Brand details</h2>
                    <p className="mt-1 text-sm text-white/40">
                      Configure exhibitor information and branding.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Company name
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        placeholder="Samsung"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Stand number
                        </label>
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/50"
                          placeholder="5C300"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Invite code
                        </label>
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/50"
                          placeholder="ISE2027"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Registration URL
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/50"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Visual theme</h2>
                    <p className="mt-1 text-sm text-white/40">
                      Select an invitation design sector.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/[0.055]"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-25 transition duration-700 group-hover:scale-105 group-hover:opacity-35"
                          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />

                        <div className="relative p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xl font-semibold">{theme.label}</div>
                              <div className="mt-2 text-sm text-white/45">
                                Premium {theme.label.toLowerCase()} invitation experience
                              </div>
                            </div>

                            <div className="h-9 w-9 rounded-full border border-white/10 bg-white/5 transition group-hover:border-blue-400/40 group-hover:bg-blue-500/15" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/35 p-5 backdrop-blur-2xl sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition hover:bg-blue-500">
                  Export PNG
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold transition hover:bg-white/10">
                  Export PDF
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold transition hover:bg-white/10">
                  LinkedIn
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold transition hover:bg-white/10">
                  ZIP Pack
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative hidden items-center justify-center overflow-hidden bg-[#02050f] xl:flex">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.55))]" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 scale-110 rounded-[48px] bg-blue-500/20 blur-3xl" />
            <div className="relative origin-center scale-[0.72] transition duration-700 hover:scale-[0.74] 2xl:scale-[0.82] 2xl:hover:scale-[0.84]">
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

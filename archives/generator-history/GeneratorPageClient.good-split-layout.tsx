'use client'

import { useState } from 'react'
import InvitePreview from '@/components/InvitePreview'
import { useSiteLanguage } from '@/components/LanguageSwitcher'
import { themes } from '@/lib/themes'
import type { ThemeKey } from '@/lib/types'

type Props = {
  initialToken?: string
}

export default function GeneratorPageClient({ initialToken }: Props) {
  const [language] = useSiteLanguage()
  const [companyName, setCompanyName] = useState('Samsung')
  const [standNumber, setStandNumber] = useState('5C300')
  const [invitationCode, setInvitationCode] = useState('ISE2027')
  const [registrationUrl, setRegistrationUrl] = useState('https://registration.example.com')
  const [theme, setTheme] = useState<ThemeKey>('audio')

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="grid min-h-[calc(100vh-92px)] lg:grid-cols-[420px_1fr]">
        <aside className="flex min-h-[calc(100vh-92px)] flex-col border-r border-white/10 bg-[#050816]/95">
          <div className="border-b border-white/10 px-7 py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              ISE 2027
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Exhibitor Invitation Generator
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/45">
              Create premium invitation assets, QR exports, and marketing packs for exhibitors in real time.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-7">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold">Brand details</h2>
                <p className="mt-1 text-sm text-white/40">Configure exhibitor information.</p>

                <div className="mt-5 space-y-4">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={standNumber} onChange={(e) => setStandNumber(e.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                    <input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                  </div>
                  <input value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold">Visual theme</h2>
                <div className="mt-5 grid gap-3">
                  {Object.entries(themes).map(([key, item]) => {
                    const active = theme === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTheme(key as ThemeKey)}
                        className={`relative overflow-hidden rounded-3xl border p-5 text-left transition ${
                          active ? 'border-blue-400' : 'border-white/10'
                        }`}
                      >
                        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${item.backgroundImage})` }} />
                        <div className="absolute inset-0 bg-black/75" />
                        <div className="relative">
                          <div className="text-xl font-semibold">{item.label}</div>
                          <div className="mt-1 text-sm text-white/45">Premium invitation theme</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/30 p-5">
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-2xl bg-blue-600 py-4 font-semibold">Export PNG</button>
              <button className="rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold">Export PDF</button>
              <button className="rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold">LinkedIn</button>
              <button className="rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold">ZIP Pack</button>
            </div>
          </div>
        </aside>

        <section className="relative hidden min-h-[calc(100vh-92px)] items-center justify-center overflow-hidden bg-[#02050f] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
          <div className="relative scale-[0.62] xl:scale-[0.72] 2xl:scale-[0.82]">
            <InvitePreview
              companyName={companyName}
              standNumber={standNumber}
              invitationCode={invitationCode}
              logoUrl=""
              registrationUrl={registrationUrl}
              theme={theme}
              language={language}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import RequestInvitationForm from './RequestInvitationForm'

export const dynamic = 'force-dynamic'

export default function RequestInvitationPage() {
  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    label: theme.label,
  }))

  const languageOptions = Object.entries(translations).map(([key, bundle]) => ({
    key,
    label: bundle.ui.languageName,
  }))

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
              ISE 2027
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Request invitation cards
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/50">
              Submit your company details, logo, sector and language preference. Once invitation codes are available, your invitation card can be generated from this request.
            </p>
          </div>

          <RequestInvitationForm themes={themeOptions} languages={languageOptions} />
        </div>
      </div>
    </main>
  )
}

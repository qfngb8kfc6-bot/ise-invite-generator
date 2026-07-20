import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import RequestInvitationForm from './RequestInvitationForm'

function getUiString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}


export const dynamic = 'force-dynamic'

export default function RequestInvitationPage() {
  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    label: theme.label,
  }))

  const languageOptions = Object.entries(translations).filter(([key]) => key !== 'ca').map(([key, bundle]) => ({
    key,
    label: getUiString(bundle.ui.languageName, key),
  }))

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <section className="rounded-[36px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
            <div className="mb-6 inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
              ISE 2027 Invitation Cards
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Request your exhibitor invitation assets
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
              Submit your company details, preferred sector image and preferred language.
              You can also include a preferred logo, but exhibitors can upload or replace
              the final logo later inside the approved generator.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-semibold text-white">What happens next?</p>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  Your request is added to the ISE invitation system for review. Once
                  approved, the ISE team will assign an invitation ID, invitation code
                  and generator link.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-semibold text-white">Your generator</p>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  Approved requests can generate PNG, PDF, LinkedIn, Email Banner and
                  ZIP Pack assets with your company name, logo and invitation code.
                </p>
              </div>

              <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
                <p className="text-sm font-semibold text-blue-100">
                  Logo recommendation
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-100/65">
                  A logo upload is optional at request stage. Exhibitors can upload or
                  replace their final logo inside the approved generator before downloading assets.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
            <div className="mb-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                Request form
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Submit company details
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Please use the company details exactly as you would like them to appear.
                Logo, theme and language can still be changed later inside the generator.
              </p>
            </div>

            <RequestInvitationForm themes={themeOptions} languages={languageOptions} />
          </section>
        </div>
      </div>
    </main>
  )
}
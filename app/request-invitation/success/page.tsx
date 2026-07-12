import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function RequestInvitationSuccessPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="w-full rounded-[36px] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/15 text-3xl">
            ✓
          </div>

          <div className="mb-6 inline-flex rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
            Request submitted
          </div>

          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your invitation request has been received
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/60">
            Thank you. Your company details have been added to the ISE invitation
            request workflow. The ISE team will review the request and assign an
            invitation ID, invitation code and generator link once approved.
          </p>

          <div className="mx-auto mt-9 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">1. Review</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                The submitted company name, logo and preferences will be checked.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">2. Assign</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                An invitation ID and invitation code will be assigned to the request.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">3. Generate</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                The approved request can then generate the downloadable assets.
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/request-invitation"
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Submit another request
            </Link>

            <Link
              href="/"
              className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
            >
              Return to homepage
            </Link>
          </div>

          <p className="mx-auto mt-7 max-w-xl text-xs leading-5 text-white/35">
            If any details need to be changed after submission, please contact the
            ISE team before the invitation assets are generated.
          </p>
        </section>
      </div>
    </main>
  )
}

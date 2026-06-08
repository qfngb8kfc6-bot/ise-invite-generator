export const dynamic = 'force-dynamic'

export default function RequestInvitationPage() {
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
              Submit your company details and logo. Once invitation codes are available, your card link can be generated from this request.
            </p>
          </div>

          <form action="/api/request-invitation" method="post" encType="multipart/form-data" className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Company name
              </label>
              <input
                name="companyName"
                required
                minLength={2}
                maxLength={120}
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Company logo
              </label>
              <input
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
              />
              <p className="mt-2 text-xs text-white/35">
                Max 3MB. Recommended minimum 300 × 120px.
              </p>
            </div>

            <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500">
              Submit request
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

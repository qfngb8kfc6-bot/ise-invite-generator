import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SuccessPageProps = {
  searchParams?: Promise<{
    requestId?: string | string[]
  }>
}

function getRequestId(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export default async function RequestInvitationSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = searchParams ? await searchParams : {}
  const requestId = getRequestId(params.requestId).trim()
  const generatorHref = requestId
    ? `/visitors/${encodeURIComponent(requestId)}`
    : ''

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
            Generator ready
          </div>

          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your invitation generator is ready
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/60">
            Thank you. Your company details have been saved and your tailored
            invitation generator has been created automatically.
          </p>

          <div className="mx-auto mt-9 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">1. Details received</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Your company information and invitation preferences have been saved.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">2. Generator prepared</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                A tailored generator has been created using the details you submitted.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">3. Create your assets</p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Open the generator to preview, customise and download your invitation assets.
              </p>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {generatorHref ? (
              <Link
                href={generatorHref}
                className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Open generator
              </Link>
            ) : (
              <Link
                href="/request-invitation"
                className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Submit request again
              </Link>
            )}

            <Link
              href="/request-invitation"
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Submit another request
            </Link>
          </div>

          <p className="mx-auto mt-7 max-w-xl text-xs leading-5 text-white/35">
            Your generator will open with your submitted company details already
            pre-filled. You can then preview and download the formats you need.
          </p>
        </section>
      </div>
    </main>
  )
}

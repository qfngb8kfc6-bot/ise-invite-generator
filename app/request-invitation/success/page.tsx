export default function RequestInvitationSuccessPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[36px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
          ✓
        </div>

        <h1 className="text-3xl font-semibold">Request received</h1>

        <p className="mt-4 text-sm leading-7 text-white/50">
          Your invitation card request has been stored. When the ISE invitation code list is supplied, this request can be assigned the next available code.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10"
        >
          Back to home
        </a>
      </div>
    </main>
  )
}

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
          <h1 className="text-4xl font-semibold text-white">
            Exhibitor Invitation Generator
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-400">
            Local development home for generating signed exhibitor invitation links
            and testing the invitation generator flow.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Open Internal Tools
            </Link>

            <Link
              href="/generator"
              className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
            >
              Open Generator
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="text-sm font-semibold text-zinc-200">JWT Flow</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Signed exhibitor access tokens verified server-side through the session route.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="text-sm font-semibold text-zinc-200">Mock EBO</h2>
              <p className="mt-2 text-sm text-zinc-400">
                The app can now simulate a real EBO-backed payload path without changing the UI.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="text-sm font-semibold text-zinc-200">Exports</h2>
              <p className="mt-2 text-sm text-zinc-400">
                PNG, PDF, and ZIP exports remain available through the generator page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
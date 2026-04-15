import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Exhibitor Invitation Generator
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            Create branded invitations, export marketing assets, and track exhibitor usage in one place.
          </p>
        </div>

        {/* Navigation cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Generator */}
          <Link
            href="/generator"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Generator</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Create and export exhibitor invitation assets.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">
              Open generator →
            </div>
          </Link>

          {/* Tools */}
          <Link
            href="/tools"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Tools</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Internal tools for testing tokens and exhibitor access.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">
              Open tools →
            </div>
          </Link>

          {/* Reports */}
          <Link
            href="/reports"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Reports</h2>
            <p className="mt-2 text-sm text-neutral-600">
              View analytics and usage by exhibitor.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">
              View reports →
            </div>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-sm text-neutral-500">
          <p>
            This tool is connected to exhibitor data and tracks usage events for reporting.
          </p>
        </div>
      </div>
    </main>
  )
}
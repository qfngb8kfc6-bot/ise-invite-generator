import { Suspense } from 'react'
import AdminLoginClient from './AdminLoginClient'

// Rendered per request so it's sent as "private, no-store". As a prerendered
// page it went out with "s-maxage=31536000", which lets a shared cache keep an
// old build's HTML (whose JS no longer exists) after a deploy.
export const dynamic = 'force-dynamic'

function AdminLoginFallback() {
  return (
    <main className="relative flex h-[calc(100vh-128px)] items-center justify-center overflow-hidden px-4 py-8 text-white">
      <div className="rounded-[28px] border border-white/14 bg-[#111827]/82 p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <p className="text-base font-semibold text-white/70">Loading admin login...</p>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginClient />
    </Suspense>
  )
}

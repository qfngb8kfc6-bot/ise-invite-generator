import { Suspense } from 'react'
import AdminLoginClient from './AdminLoginClient'

function AdminLoginFallback() {
  return (
    <main className="relative flex min-h-[calc(100vh-92px)] items-center justify-center overflow-hidden px-4 py-16 text-white">
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

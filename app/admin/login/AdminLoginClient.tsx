'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function AdminLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/reports'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Invalid username or password.')
        return
      }

      router.replace(redirectTo)
      router.refresh()
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-92px)] items-center justify-center overflow-hidden px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,63,143,0.34),transparent_36%),radial-gradient(circle_at_80%_70%,rgba(0,166,214,0.16),transparent_34%)]" />

      <div className="relative w-full max-w-[520px]">
        <div className="mb-8 flex justify-center">
          <Image
            src="/branding/ise-logo-white.png"
            alt="Integrated Systems Europe"
            width={230}
            height={110}
            priority
            className="h-auto w-[230px] object-contain"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/14 bg-[#111827]/82 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              Registration Dashboard
            </h1>
            <p className="mt-2 text-base font-medium text-white/55">
              Sign in to continue
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-white/62">
                Email / Username
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="mt-2 w-full rounded-xl border border-white/16 bg-white/10 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/18"
                placeholder="admin@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/62">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-white/16 bg-white/10 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/18"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-blue-500 px-5 py-3.5 text-base font-bold text-white shadow-[0_18px_45px_rgba(59,130,246,0.28)] transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm font-medium text-white/30">
          ISE 2027 · Exhibitor Invitation Platform
        </p>
      </div>
    </main>
  )
}

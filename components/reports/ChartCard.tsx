'use client'

import type { ReactNode } from 'react'

type Props = {
  title: string
  description: string
  emptyMessage: string
  hasData: boolean
  chartsReady: boolean
  children: ReactNode
  loadingMessage: string
}

export default function ChartCard({
  title,
  description,
  emptyMessage,
  hasData,
  chartsReady,
  children,
  loadingMessage,
}: Props) {
  return (
    <section className="relative min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative p-4 sm:p-6 lg:p-7">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>

          <p className="text-sm leading-6 text-neutral-400">
            {description}
          </p>
        </div>

        <div className="mt-6 h-[300px] min-w-0 sm:h-[380px]">
          {!hasData ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-3xl">
                📊
              </div>

              <div>
                <div className="text-sm font-medium text-neutral-300">
                  No chart data available
                </div>

                <div className="mt-1 text-sm text-neutral-500">
                  {emptyMessage}
                </div>
              </div>
            </div>
          ) : !chartsReady ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-black/20 px-6 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white" />

              <div className="text-sm text-neutral-400">
                {loadingMessage}
              </div>
            </div>
          ) : (
            <div className="h-full min-w-0 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-2 backdrop-blur-sm">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

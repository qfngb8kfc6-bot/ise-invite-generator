'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type Size = {
  width: number
  height: number
}

type Props = {
  children: (size: Size) => ReactNode
  minHeight?: number
  className?: string
}

export default function MeasuredChart({
  children,
  minHeight = 320,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [size, setSize] = useState<Size>({
    width: 0,
    height: minHeight,
  })

  const updateSize = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()

    const width = Math.max(280, Math.floor(rect.width))
    const height = Math.max(minHeight, Math.floor(rect.height))

    setSize((prev) => {
      if (prev.width === width && prev.height === height) {
        return prev
      }

      return {
        width,
        height,
      }
    })
  }, [minHeight])

  useEffect(() => {
    updateSize()

    const element = containerRef.current

    if (!element) return

    let resizeObserver: ResizeObserver | null = null

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize()
      })

      resizeObserver.observe(element)
    }

    window.addEventListener('resize', updateSize)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [updateSize])

  return (
    <div
      ref={containerRef}
      className={`relative h-full min-h-[320px] w-full min-w-0 overflow-hidden rounded-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_65%)]" />

      <div className="relative h-full w-full min-w-0 overflow-hidden">
        {size.width > 0 ? children(size) : null}
      </div>
    </div>
  )
}

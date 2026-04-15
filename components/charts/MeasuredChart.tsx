'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type MeasuredChartProps = {
  height?: number
  children: (size: { width: number; height: number }) => ReactNode
}

export default function MeasuredChart({
  height = 360,
  children,
}: MeasuredChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateSize = () => {
      const nextWidth = Math.floor(element.clientWidth)
      const nextHeight = Math.floor(element.clientHeight) || height

      if (nextWidth > 0 && nextHeight > 0) {
        setSize({
          width: nextWidth,
          height: nextHeight,
        })
      }
    }

    updateSize()

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    observer.observe(element)
    window.addEventListener('resize', updateSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [height])

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-w-0"
      style={{ height: `${height}px` }}
    >
      {size.width > 0 ? children(size) : null}
    </div>
  )
}
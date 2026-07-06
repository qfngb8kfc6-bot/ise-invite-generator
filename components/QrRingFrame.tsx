type QrRingFrameProps = {
  qrDataUrl: string
  unavailableText?: string
  variant?: 'main' | 'linkedin' | 'square' | 'email'
}

const frameStyles = {
  main: {
    outer: 'h-[245px] w-[245px]',
    svg: 245,
    qr: 'h-[86px] w-[86px]',
    tile: 'rounded-[14px] bg-white p-2.5 shadow-[0_12px_28px_rgba(8,8,50,0.14)]',
    fallback: 'h-[86px] w-[86px] text-[9px]',
    strokeOuter: 7,
    strokeMid: 4,
    strokeInner: 2,
  },
  linkedin: {
    outer: 'h-[185px] w-[185px]',
    svg: 185,
    qr: 'h-[88px] w-[88px]',
    tile: 'rounded-[15px] bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.14)]',
    fallback: 'h-[88px] w-[88px] text-[9px]',
    strokeOuter: 6,
    strokeMid: 3.2,
    strokeInner: 1.5,
  },
  square: {
    outer: 'h-[250px] w-[250px]',
    svg: 250,
    qr: 'h-[98px] w-[98px]',
    tile: 'rounded-[16px] bg-white p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.14)]',
    fallback: 'h-[98px] w-[98px] text-[10px]',
    strokeOuter: 8,
    strokeMid: 4.5,
    strokeInner: 2.2,
  },
  email: {
    outer: 'h-[138px] w-[138px]',
    svg: 138,
    qr: 'h-[68px] w-[68px]',
    tile: 'rounded-[12px] bg-white p-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.12)]',
    fallback: 'h-[68px] w-[68px] text-[8px]',
    strokeOuter: 4.6,
    strokeMid: 2.6,
    strokeInner: 1.2,
  },
} as const

export default function QrRingFrame({
  qrDataUrl,
  unavailableText = 'QR unavailable',
  variant = 'main',
}: QrRingFrameProps) {
  const style = frameStyles[variant]
  const size = style.svg
  const centre = size / 2

  /*
    These are intentionally bold/export-safe rings.
    The official PNG is very thin/dark, so it becomes almost invisible on the ISE blue backgrounds.
    This recreates the ISE double-ring shape with stronger strokes so it exports reliably.
  */
  const rx = size * 0.37
  const ry = size * 0.48

  const showRings = variant === 'main' || variant === 'square'

  return (
    <div className={`relative flex ${style.outer} shrink-0 items-center justify-center overflow-visible`}>
      {showRings ? (
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${size} ${size}`}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(-13 ${centre} ${centre})`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.95"
            strokeWidth={style.strokeOuter}
          />
          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(13 ${centre} ${centre})`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.95"
            strokeWidth={style.strokeOuter}
          />

          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(-13 ${centre} ${centre})`}
            fill="none"
            stroke="#70e7ff"
            strokeOpacity="0.95"
            strokeWidth={style.strokeMid}
          />
          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(13 ${centre} ${centre})`}
            fill="none"
            stroke="#70e7ff"
            strokeOpacity="0.95"
            strokeWidth={style.strokeMid}
          />

          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(-13 ${centre} ${centre})`}
            fill="none"
            stroke="#1b1464"
            strokeOpacity="1"
            strokeWidth={style.strokeInner}
          />
          <ellipse
            cx={centre}
            cy={centre}
            rx={rx}
            ry={ry}
            transform={`rotate(13 ${centre} ${centre})`}
            fill="none"
            stroke="#1b1464"
            strokeOpacity="1"
            strokeWidth={style.strokeInner}
          />
        </svg>
      ) : null}

      <div className={`relative z-10 ${style.tile}`}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Registration QR code"
            className={`${style.qr} object-contain`}
          />
        ) : (
          <div className={`flex ${style.fallback} items-center justify-center text-center font-semibold text-zinc-400`}>
            {unavailableText}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useId, useRef } from 'react'
import { useLenis } from 'lenis/react'
import './ParticleReveal.css'

// Scroll-driven ink-reveal: a grayscale copy of the image sits underneath,
// a full-color copy sits on top clipped by an SVG mask shaped like a wavy
// blob that grows downward from the top edge as the card scrolls through
// the viewport. An feTurbulence/feDisplacementMap filter roughens the
// blob's edge so it reads as an organic ink flood rather than a clean wipe.
export function ParticleReveal({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const uid = useId().replace(/:/g, '')

  useEffect(() => {
    pathRef.current?.setAttribute('d', 'M 0 0 Q 500 0 1000 0 L 1000 0 L 0 0 Z')
  }, [])

  useLenis(() => {
    const el = containerRef.current
    const path = pathRef.current
    if (!el || !path) return

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const progress = Math.min(
      1,
      Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
    )

    const y = progress * 1000
    const bulge = progress * 260
    path.setAttribute('d', `M 0 ${y} Q 500 ${y + bulge} 1000 ${y} L 1000 0 L 0 0 Z`)
  })

  return (
    <div ref={containerRef} className="particle-reveal">
      <img src={src} alt="" aria-hidden="true" className="particle-reveal__base" />
      <svg
        className="particle-reveal__layer"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`ink-filter-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <mask id={`ink-mask-${uid}`} maskContentUnits="userSpaceOnUse">
            <path ref={pathRef} fill="white" style={{ filter: `url(#ink-filter-${uid})` }} />
          </mask>
        </defs>
        <image
          href={src}
          x="0"
          y="0"
          width="1000"
          height="1000"
          preserveAspectRatio="none"
          mask={`url(#ink-mask-${uid})`}
        />
      </svg>
    </div>
  )
}

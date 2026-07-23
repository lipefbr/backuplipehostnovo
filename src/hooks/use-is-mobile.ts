'use client'

import * as React from 'react'

/**
 * Detect mobile breakpoint (matches Tailwind's `md` = 768px).
 * Used to skip mount/scroll animations on mobile for instant page render.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobile
}

'use client'

import { useEffect, useState } from 'react'

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const leave = () => setVisible(false)

    window.addEventListener('mousemove', move)
    document.body.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.body.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div
      className="cursor-glow hidden md:block"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden
    />
  )
}

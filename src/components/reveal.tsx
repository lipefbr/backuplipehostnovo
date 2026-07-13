'use client'

import * as React from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: Direction
  once?: boolean
  as?: 'div' | 'section' | 'span' | 'li' | 'article'
}

const offset = 40

const getVariants = (direction: Direction): Variants => {
  switch (direction) {
    case 'up':
      return {
        hidden: { opacity: 0, y: offset },
        visible: { opacity: 1, y: 0 },
      }
    case 'down':
      return {
        hidden: { opacity: 0, y: -offset },
        visible: { opacity: 1, y: 0 },
      }
    case 'left':
      return {
        hidden: { opacity: 0, x: offset },
        visible: { opacity: 1, x: 0 },
      }
    case 'right':
      return {
        hidden: { opacity: 0, x: -offset },
        visible: { opacity: 1, x: 0 },
      }
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1 },
      }
    case 'blur':
      return {
        hidden: { opacity: 0, filter: 'blur(12px)' },
        visible: { opacity: 1, filter: 'blur(0px)' },
      }
  }
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  once = true,
  as = 'div',
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-80px' })
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={getVariants(direction)}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}

// Stagger container + item for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

interface StaggerProps {
  children: React.ReactNode
  className?: string
  once?: boolean
}

export function Stagger({ children, className, once = true }: StaggerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

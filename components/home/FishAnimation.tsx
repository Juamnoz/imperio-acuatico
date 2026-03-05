'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Fish {
  id: number
  y: number
  size: number
  duration: number
  delay: number
  flip: boolean
  emoji: string
}

const fishEmojis = ['🐠', '🐟', '🐡']

export function FishAnimation() {
  const [fishes, setFishes] = useState<Fish[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFishes([
      { id: 1, y: 20, size: 28, duration: 18, delay: 0, flip: false, emoji: '🐠' },
      { id: 2, y: 55, size: 22, duration: 24, delay: 6, flip: true, emoji: '🐟' },
      { id: 3, y: 75, size: 32, duration: 20, delay: 12, flip: false, emoji: '🐡' },
    ])
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {fishes.map((fish) => (
        <motion.div
          key={fish.id}
          className="absolute"
          style={{ top: `${fish.y}%`, fontSize: fish.size }}
          animate={{ x: fish.flip ? ['110vw', '-10vw'] : ['-10vw', '110vw'] }}
          transition={{
            duration: fish.duration,
            delay: fish.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.span
            style={{ display: 'inline-block', scaleX: fish.flip ? -1 : 1 }}
            animate={{ y: [0, -8, 0, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {fish.emoji}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}

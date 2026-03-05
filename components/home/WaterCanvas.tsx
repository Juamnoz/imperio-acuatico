'use client'

import { useEffect, useRef } from 'react'

interface Bubble {
  x: number
  y: number
  r: number
  speed: number
  opacity: number
  wobble: number
  wobbleSpeed: number
  wobbleOffset: number
}

export function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let bubbles: Bubble[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createBubble = (): Bubble => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 20,
      r: Math.random() * 6 + 2,
      speed: Math.random() * 0.8 + 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      wobbleOffset: Math.random() * 30 + 10,
    })

    const init = () => {
      bubbles = Array.from({ length: 25 }, () => ({
        ...createBubble(),
        y: Math.random() * window.innerHeight,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bubbles.forEach((b, i) => {
        b.y -= b.speed
        b.wobble += b.wobbleSpeed
        const wx = b.x + Math.sin(b.wobble) * b.wobbleOffset

        if (b.y + b.r < 0) {
          bubbles[i] = createBubble()
          return
        }

        ctx.beginPath()
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `oklch(0.52 0.1 195 / ${b.opacity})`
        ctx.lineWidth = 1
        ctx.stroke()

        // shimmer highlight
        ctx.beginPath()
        ctx.arc(wx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `oklch(0.72 0.1 195 / ${b.opacity * 0.5})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    />
  )
}

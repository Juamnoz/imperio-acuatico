'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

/* ─── types ─── */
interface Bubble { x: number; y: number; r: number; speed: number; wobble: number; phase: number }
interface Fish { x: number; y: number; size: number; speed: number; dir: 1 | -1; vy: number; color: string; tailPhase: number; depth: number }
interface Weed { x: number; segments: number; color: string; phase: number; speed: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }

const FISH_COLORS = [
  ['#FF6B35','#FF8C42'],   // naranja betta
  ['#FFD700','#FFA500'],   // dorado
  ['#00E5FF','#0288D1'],   // neón cian
  ['#FF1744','#D50000'],   // rojo disco
  ['#76FF03','#64DD17'],   // verde neón
  ['#E040FB','#AA00FF'],   // morado
  ['#FF6D00','#E65100'],   // naranja oscuro
]

export function AquariumCTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    /* ─── bubbles ─── */
    const bubbles: Bubble[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * W(),
      y: H() + Math.random() * H(),
      r: 2 + Math.random() * 5,
      speed: 0.4 + Math.random() * 0.8,
      wobble: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))

    /* ─── fish ─── */
    const fish: Fish[] = Array.from({ length: 9 }, (_, i) => {
      const dir = Math.random() > 0.5 ? 1 : -1
      const colors = FISH_COLORS[i % FISH_COLORS.length]
      return {
        x: dir === 1 ? -80 : W() + 80,
        y: H() * 0.2 + Math.random() * H() * 0.55,
        size: 14 + Math.random() * 22,
        speed: 0.5 + Math.random() * 1.2,
        dir: dir as 1 | -1,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[0],
        tailPhase: Math.random() * Math.PI * 2,
        depth: 0.4 + Math.random() * 0.6,
      }
    })

    /* ─── weeds / algae ─── */
    const weeds: Weed[] = Array.from({ length: 14 }, () => ({
      x: 20 + Math.random() * (W() - 40),
      segments: 5 + Math.floor(Math.random() * 6),
      color: Math.random() > 0.4
        ? `hsl(${130 + Math.random() * 30},${70 + Math.random() * 20}%,${25 + Math.random() * 15}%)`
        : `hsl(${160 + Math.random() * 20},${60 + Math.random() * 20}%,${30 + Math.random() * 10}%)`,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
    }))

    /* ─── particles (light rays) ─── */
    const particles: Particle[] = []
    let t = 0

    const spawnParticle = () => {
      particles.push({
        x: Math.random() * W(),
        y: 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.4,
        life: 0,
        maxLife: 180 + Math.random() * 120,
        color: `hsl(${180 + Math.random() * 40},80%,70%)`,
      })
    }

    /* ─── draw fish ─── */
    function drawFish(f: Fish, time: number) {
      ctx.save()
      ctx.globalAlpha = 0.55 + f.depth * 0.45
      ctx.translate(f.x, f.y)
      if (f.dir === -1) ctx.scale(-1, 1)

      const tail = Math.sin(time * 0.06 + f.tailPhase) * 0.35
      const s = f.size

      // tail
      ctx.beginPath()
      ctx.moveTo(-s * 0.6, 0)
      ctx.lineTo(-s * 1.3, -s * 0.5 + tail * s)
      ctx.lineTo(-s * 1.3, s * 0.5 + tail * s)
      ctx.closePath()
      ctx.fillStyle = f.color
      ctx.fill()

      // body
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 0.9, s * 0.42, 0, 0, Math.PI * 2)
      ctx.fillStyle = f.color
      ctx.fill()

      // belly shine
      const grad = ctx.createRadialGradient(-s * 0.1, -s * 0.1, 0, 0, 0, s * 0.9)
      grad.addColorStop(0, 'rgba(255,255,255,0.35)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fill()

      // fin
      ctx.beginPath()
      ctx.moveTo(s * 0.1, -s * 0.38)
      ctx.lineTo(-s * 0.2, -s * 0.7 + Math.sin(time * 0.08 + f.tailPhase) * s * 0.1)
      ctx.lineTo(-s * 0.45, -s * 0.38)
      ctx.fillStyle = f.color + 'aa'
      ctx.fill()

      // eye
      ctx.beginPath()
      ctx.arc(s * 0.45, -s * 0.08, s * 0.1, 0, Math.PI * 2)
      ctx.fillStyle = '#111'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(s * 0.47, -s * 0.1, s * 0.035, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()

      ctx.restore()
    }

    /* ─── draw weed ─── */
    function drawWeed(w: Weed, time: number) {
      const segH = (H() * 0.12 + w.segments * 10) / w.segments
      ctx.save()
      ctx.lineWidth = 3 + w.segments * 0.4
      ctx.strokeStyle = w.color
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      let px = w.x, py = H()
      for (let i = 0; i < w.segments; i++) {
        const sway = Math.sin(time * w.speed * 0.02 + w.phase + i * 0.5) * (6 + i * 1.5)
        const nx = px + sway
        const ny = py - segH
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.quadraticCurveTo(px + sway * 1.5, (py + ny) / 2, nx, ny)
        ctx.globalAlpha = 0.6 + i / w.segments * 0.4
        ctx.stroke()
        px = nx; py = ny
      }
      ctx.restore()
    }

    /* ─── draw bubble ─── */
    function drawBubble(b: Bubble, time: number) {
      ctx.save()
      const wx = b.x + Math.sin(time * 0.02 * b.wobble + b.phase) * 8
      ctx.beginPath()
      ctx.arc(wx, b.y, b.r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(180,230,255,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      // shine
      ctx.beginPath()
      ctx.arc(wx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()
      ctx.restore()
    }

    /* ─── main loop ─── */
    function tick() {
      t++
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)

      /* background water gradient */
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, 'oklch(0.14 0.03 195)')
      bg.addColorStop(0.5, 'oklch(0.10 0.025 200)')
      bg.addColorStop(1, 'oklch(0.08 0.02 205)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      /* caustic light rays from top */
      for (let i = 0; i < 6; i++) {
        const rx = (w / 6) * i + Math.sin(t * 0.008 + i) * 40
        const rayGrad = ctx.createLinearGradient(rx, 0, rx + 30, h * 0.7)
        rayGrad.addColorStop(0, 'rgba(0,230,255,0.06)')
        rayGrad.addColorStop(1, 'rgba(0,230,255,0)')
        ctx.beginPath()
        ctx.moveTo(rx, 0)
        ctx.lineTo(rx + 40, h * 0.7)
        ctx.lineTo(rx + 60, h * 0.7)
        ctx.lineTo(rx + 20, 0)
        ctx.fillStyle = rayGrad
        ctx.fill()
      }

      /* sand bottom */
      const sand = ctx.createLinearGradient(0, h - 28, 0, h)
      sand.addColorStop(0, 'oklch(0.30 0.05 70 / 0.9)')
      sand.addColorStop(1, 'oklch(0.22 0.04 60)')
      ctx.fillStyle = sand
      ctx.beginPath()
      ctx.moveTo(0, h - 28)
      for (let x = 0; x <= w; x += 40) {
        ctx.lineTo(x, h - 24 + Math.sin(x * 0.05 + t * 0.005) * 4)
      }
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fill()

      /* weeds (behind fish) */
      weeds.forEach(weed => drawWeed(weed, t))

      /* particles */
      if (t % 12 === 0 && particles.length < 25) spawnParticle()
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.life++
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()
        ctx.globalAlpha = 1
        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      /* fish */
      fish.forEach(f => {
        f.x += f.speed * f.dir
        f.y += f.vy
        f.y = Math.max(h * 0.08, Math.min(h * 0.78, f.y))
        f.vy += (Math.random() - 0.5) * 0.04
        f.vy *= 0.98
        if (f.dir === 1 && f.x > w + 100) { f.x = -80; f.y = h * 0.15 + Math.random() * h * 0.6 }
        if (f.dir === -1 && f.x < -100) { f.x = w + 80; f.y = h * 0.15 + Math.random() * h * 0.6 }
        drawFish(f, t)
      })

      /* bubbles */
      bubbles.forEach(b => {
        b.y -= b.speed
        if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w }
        drawBubble(b, t)
      })

      /* top water shimmer */
      const shimmer = ctx.createLinearGradient(0, 0, 0, 18)
      shimmer.addColorStop(0, 'rgba(0,200,255,0.18)')
      shimmer.addColorStop(1, 'rgba(0,200,255,0)')
      ctx.fillStyle = shimmer
      ctx.fillRect(0, 0, w, 18)

      /* LED strip top */
      const led = ctx.createLinearGradient(0, 0, w, 0)
      led.addColorStop(0, 'rgba(0,255,200,0)')
      led.addColorStop(0.3, 'rgba(0,255,220,0.25)')
      led.addColorStop(0.5, 'rgba(100,220,255,0.35)')
      led.addColorStop(0.7, 'rgba(0,255,220,0.25)')
      led.addColorStop(1, 'rgba(0,255,200,0)')
      ctx.fillStyle = led
      ctx.fillRect(0, 0, w, 6)

      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="container mx-auto max-w-7xl px-6 py-16">
      {/* Aquarium frame */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 shadow-2xl shadow-primary/20"
           style={{ minHeight: 380 }}>

        {/* Glass reflection top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none rounded-t-3xl" />

        {/* Glass reflection left */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-white/20 via-transparent to-transparent z-20 pointer-events-none rounded-l-3xl" />

        {/* LED bar top */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-20 pointer-events-none" />

        {/* Animated canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16 md:py-20 min-h-[380px]">
          <div className="backdrop-blur-sm bg-black/30 rounded-2xl px-8 py-8 border border-white/10 max-w-xl">
            <p className="mb-2 text-sm font-medium text-cyan-300 drop-shadow-md">¿Listo para comenzar?</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Tu acuario perfecto<br />está a un mensaje
            </h2>
            <p className="text-white/70 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Escríbenos por WhatsApp para cotizaciones, asesoría personalizada o cualquier pregunta sobre nuestros peces.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/573027471832?text=Hola%2C%20quiero%20asesoría%20para%20mi%20acuario"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-500/40 transition-all hover:bg-green-400 hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Chatear en WhatsApp
              </a>
              <Link
                href="/tienda"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </div>

        {/* Corner screws (decorative tank corners) */}
        {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(pos => (
          <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full bg-primary/50 border border-primary/80 z-20`} />
        ))}
      </div>
    </section>
  )
}

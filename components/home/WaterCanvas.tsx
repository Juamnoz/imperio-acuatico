'use client'

import { useEffect, useRef } from 'react'

/* ─── Fish species configs ─── */
const SPECIES = [
  // Betta — long flowing fins, vivid red/blue
  { bodyColor: '#C0392B', finColor: '#8E44AD', bellyColor: '#E74C3C', stripes: false, longFin: true,  size: 1.2 },
  // Neon tetra — blue stripe + red tail half
  { bodyColor: '#2980B9', finColor: '#3498DB', bellyColor: '#E8F8F5', stripes: false, longFin: false, size: 0.6, neon: true },
  // Angel — tall flat body, black stripes
  { bodyColor: '#BDC3C7', finColor: '#95A5A6', bellyColor: '#ECF0F1', stripes: true,  longFin: true,  size: 1.6, tall: true },
  // Guppy — small, colorful tail
  { bodyColor: '#F39C12', finColor: '#E67E22', bellyColor: '#FAD7A0', stripes: false, longFin: true,  size: 0.7 },
  // Disco — round, striped
  { bodyColor: '#1ABC9C', finColor: '#16A085', bellyColor: '#A8E6CF', stripes: true,  longFin: false, size: 1.4, round: true },
  // Flowerhorn — hump, bright orange
  { bodyColor: '#E74C3C', finColor: '#C0392B', bellyColor: '#FADBD8', stripes: false, longFin: false, size: 1.5, hump: true },
  // Aulonocara — deep blue metallic
  { bodyColor: '#2471A3', finColor: '#1A5276', bellyColor: '#5DADE2', stripes: false, longFin: false, size: 1.1 },
  // Molly — black sleek
  { bodyColor: '#1C2833', finColor: '#2C3E50', bellyColor: '#34495E', stripes: false, longFin: false, size: 0.9 },
]

interface FishObj {
  x: number; y: number; vx: number; vy: number
  species: typeof SPECIES[0]
  tailPhase: number; bodyPhase: number
  scale: number; dir: 1 | -1
  depth: number
}

interface Rock {
  x: number; y: number; rx: number; ry: number
  angle: number; color: string; darkColor: string
}

interface Plant {
  type: 'anubias' | 'javafern' | 'vallisneria' | 'rotala'
  x: number; phase: number; speed: number; height: number; color: string
}

interface Bubble {
  x: number; y: number; r: number; speed: number; wobble: number; phase: number
}

export function WaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const W = () => canvas.width
    const H = () => canvas.height

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ─── Rocks ─── */
    const rocks: Rock[] = Array.from({ length: 28 }, () => {
      const hue = 20 + Math.random() * 30
      const light = 18 + Math.random() * 15
      return {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight - 20 - Math.random() * 40,
        rx: 18 + Math.random() * 55,
        ry: 10 + Math.random() * 28,
        angle: (Math.random() - 0.5) * 0.5,
        color: `hsl(${hue},${10 + Math.random() * 15}%,${light}%)`,
        darkColor: `hsl(${hue},${8 + Math.random() * 10}%,${light - 8}%)`,
      }
    }).sort((a, b) => a.y - b.y)

    /* ─── Plants ─── */
    const plants: Plant[] = []
    const plantTypes: Plant['type'][] = ['anubias', 'javafern', 'vallisneria', 'rotala']
    for (let i = 0; i < 22; i++) {
      const type = plantTypes[Math.floor(Math.random() * plantTypes.length)]
      plants.push({
        type,
        x: 30 + (i / 22) * (window.innerWidth - 60) + (Math.random() - 0.5) * 60,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.35,
        height: 60 + Math.random() * 120,
        color: type === 'anubias'   ? `hsl(${120 + Math.random()*15},${55+Math.random()*20}%,${18+Math.random()*10}%)`
             : type === 'javafern'  ? `hsl(${130 + Math.random()*15},${60+Math.random()*20}%,${20+Math.random()*10}%)`
             : type === 'rotala'    ? `hsl(${5 + Math.random()*20},${60+Math.random()*25}%,${25+Math.random()*10}%)`
                                    : `hsl(${115 + Math.random()*20},${50+Math.random()*20}%,${22+Math.random()*10}%)`,
      })
    }

    /* ─── Bubbles ─── */
    const bubbles: Bubble[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * window.innerHeight,
      r: 1.5 + Math.random() * 5,
      speed: 0.3 + Math.random() * 0.7,
      wobble: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    }))

    /* ─── Fish ─── */
    const fishes: FishObj[] = Array.from({ length: 12 }, (_, i) => {
      const sp = SPECIES[i % SPECIES.length]
      const dir = Math.random() > 0.5 ? 1 : -1
      return {
        x: dir === 1 ? -150 : window.innerWidth + 150,
        y: window.innerHeight * 0.1 + Math.random() * window.innerHeight * 0.65,
        vx: (0.4 + Math.random() * 0.9) * dir,
        vy: (Math.random() - 0.5) * 0.2,
        species: sp,
        tailPhase: Math.random() * Math.PI * 2,
        bodyPhase: Math.random() * Math.PI * 2,
        scale: 16 * sp.size,
        dir,
        depth: 0.4 + Math.random() * 0.6,
      }
    })

    /* ══ DRAW PLANTS ══ */
    function drawAnubias(px: number, baseY: number, ph: number, spd: number, ht: number, color: string) {
      const sway = Math.sin(t * spd * 0.015 + ph) * 5
      const stemX = px + sway
      // main stem
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(px, baseY)
      ctx.quadraticCurveTo(stemX, baseY - ht * 0.5, stemX, baseY - ht)
      ctx.stroke()
      // 3-4 broad leaves
      for (let l = 0; l < 4; l++) {
        const ly = baseY - ht * (0.3 + l * 0.2)
        const lx = stemX + Math.sin(t * spd * 0.015 + ph + l) * 3
        const lsway = Math.sin(t * spd * 0.02 + ph + l * 1.2) * 8
        const side = l % 2 === 0 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(lx, ly)
        ctx.bezierCurveTo(
          lx + side * (25 + l * 5) + lsway, ly - 8,
          lx + side * (20 + l * 5) + lsway * 1.5, ly - 22,
          lx + side * (5 + l * 2) + lsway * 0.5, ly - 30 - l * 3
        )
        ctx.fillStyle = color
        ctx.globalAlpha = 0.75
        ctx.fill()
        // vein
        ctx.beginPath()
        ctx.moveTo(lx, ly)
        ctx.lineTo(lx + side * 12 + lsway * 0.5, ly - 20)
        ctx.strokeStyle = color.replace(')', ',0.5)').replace('hsl', 'hsla')
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()
    }

    function drawJavaFern(px: number, baseY: number, ph: number, spd: number, ht: number, color: string) {
      ctx.save()
      for (let f = 0; f < 5; f++) {
        const angle = -0.8 + f * 0.4 + Math.sin(t * spd * 0.015 + ph + f) * 0.12
        const frondH = ht * (0.5 + f * 0.1)
        ctx.beginPath()
        ctx.moveTo(px, baseY)
        const ex = px + Math.sin(angle) * frondH
        const ey = baseY - Math.cos(angle) * frondH
        const cx1 = px + Math.sin(angle - 0.3) * frondH * 0.5
        const cy1 = baseY - Math.cos(angle - 0.3) * frondH * 0.5
        ctx.quadraticCurveTo(cx1, cy1, ex, ey)
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5 - f * 0.3
        ctx.globalAlpha = 0.8
        ctx.stroke()
        // frond shape
        ctx.beginPath()
        const fw = 8 + f * 2
        ctx.ellipse(ex, ey, fw, 3, angle - Math.PI / 2, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.6
        ctx.fill()
      }
      ctx.restore()
    }

    function drawVallisneria(px: number, baseY: number, ph: number, spd: number, ht: number, color: string) {
      ctx.save()
      const blades = 3 + Math.floor(ht / 40)
      for (let b = 0; b < blades; b++) {
        const bx = px + (b - blades / 2) * 6
        const sway = Math.sin(t * spd * 0.018 + ph + b * 0.7) * 18
        ctx.beginPath()
        ctx.moveTo(bx, baseY)
        ctx.bezierCurveTo(
          bx + sway * 0.3, baseY - ht * 0.4,
          bx + sway * 0.7, baseY - ht * 0.7,
          bx + sway, baseY - ht
        )
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.7
        ctx.stroke()
      }
      ctx.restore()
    }

    function drawRotala(px: number, baseY: number, ph: number, spd: number, ht: number, color: string) {
      ctx.save()
      const segments = Math.floor(ht / 15)
      let cx = px, cy = baseY
      for (let s = 0; s < segments; s++) {
        const sway = Math.sin(t * spd * 0.02 + ph + s * 0.5) * 6
        const nx = cx + sway
        const ny = cy - 14
        // stem
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(nx, ny)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.8
        ctx.stroke()
        // tiny leaves
        if (s % 2 === 0) {
          ctx.beginPath()
          ctx.ellipse(nx - 5 + sway * 0.5, ny + 2, 5, 2, -0.5, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.globalAlpha = 0.7
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(nx + 5 + sway * 0.5, ny + 2, 5, 2, 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
        cx = nx; cy = ny
      }
      ctx.restore()
    }

    /* ══ DRAW FISH ══ */
    function drawFish(f: FishObj) {
      const { x, y, species: sp, tailPhase, scale, dir, depth } = f
      const s = scale
      const swim = Math.sin(t * 0.05 + tailPhase)
      const bodyWave = swim * 0.08

      ctx.save()
      ctx.globalAlpha = 0.45 + depth * 0.55
      ctx.translate(x, y)
      if (dir === -1) ctx.scale(-1, 1)

      // Body undulation transform
      ctx.rotate(bodyWave * 0.5)

      // ── Tail ──
      if (sp.longFin) {
        ctx.beginPath()
        ctx.moveTo(-s * 0.55, 0)
        ctx.bezierCurveTo(-s * 1.1, -s * 0.7 + swim * s * 0.4, -s * 1.6, -s * 0.9 + swim * s * 0.5, -s * 1.4, swim * s * 0.3)
        ctx.bezierCurveTo(-s * 1.6, s * 0.9 + swim * s * 0.5, -s * 1.1, s * 0.7 + swim * s * 0.4, -s * 0.55, 0)
        ctx.fillStyle = sp.finColor + 'cc'
        ctx.fill()
      } else if (sp.tall) {
        // Angel-style forked tail
        ctx.beginPath()
        ctx.moveTo(-s * 0.5, 0)
        ctx.lineTo(-s * 1.2, -s * 0.7 + swim * s * 0.5)
        ctx.lineTo(-s * 0.9, 0)
        ctx.lineTo(-s * 1.2, s * 0.7 + swim * s * 0.5)
        ctx.closePath()
        ctx.fillStyle = sp.finColor
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(-s * 0.5, 0)
        ctx.lineTo(-s * 1.1, -s * 0.5 + swim * s * 0.35)
        ctx.lineTo(-s * 1.1, s * 0.5 + swim * s * 0.35)
        ctx.closePath()
        ctx.fillStyle = sp.finColor
        ctx.fill()
      }

      // ── Body ──
      const bw = sp.tall ? s * 0.45 : sp.round ? s * 0.92 : s * 0.88
      const bh = sp.tall ? s * 0.75 : sp.round ? s * 0.72 : s * 0.38

      ctx.beginPath()
      ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2)
      ctx.fillStyle = sp.bodyColor
      ctx.fill()

      // ── Belly highlight ──
      const bellyGrad = ctx.createLinearGradient(0, -bh, 0, bh)
      bellyGrad.addColorStop(0, sp.bodyColor)
      bellyGrad.addColorStop(0.5, sp.bellyColor + 'aa')
      bellyGrad.addColorStop(1, sp.bodyColor)
      ctx.beginPath()
      ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2)
      ctx.fillStyle = bellyGrad
      ctx.fill()

      // ── Stripes (angel/disco) ──
      if (sp.stripes) {
        ctx.save()
        ctx.clip()  // clip to body
        ctx.beginPath()
        ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2)
        ctx.clip()
        for (let st = 0; st < 3; st++) {
          const sx = -bw * 0.3 + st * bw * 0.35
          ctx.fillStyle = 'rgba(0,0,0,0.25)'
          ctx.fillRect(sx, -bh, bw * 0.12, bh * 2)
        }
        ctx.restore()
      }

      // ── Neon stripe (neon tetra) ──
      if ((sp as any).neon) {
        ctx.beginPath()
        ctx.moveTo(-bw * 0.6, -bh * 0.15)
        ctx.lineTo(bw * 0.5, -bh * 0.15)
        ctx.lineWidth = bh * 0.3
        ctx.strokeStyle = '#00E5FF'
        ctx.globalAlpha *= 0.8
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(-bw * 0.1, bh * 0.1)
        ctx.lineTo(bw * 0.5, bh * 0.1)
        ctx.strokeStyle = '#E74C3C'
        ctx.lineWidth = bh * 0.25
        ctx.stroke()
        ctx.globalAlpha = 0.45 + depth * 0.55
      }

      // ── Head hump (flowerhorn) ──
      if ((sp as any).hump) {
        ctx.beginPath()
        ctx.ellipse(bw * 0.4, -bh * 0.6, bw * 0.35, bh * 0.5, 0.3, 0, Math.PI * 2)
        ctx.fillStyle = sp.bodyColor
        ctx.fill()
      }

      // ── Dorsal fin ──
      ctx.beginPath()
      ctx.moveTo(-bw * 0.1, -bh)
      ctx.quadraticCurveTo(
        bw * 0.2, -bh - s * 0.35 + swim * s * 0.08,
        bw * 0.5, -bh * 0.7
      )
      ctx.lineTo(bw * 0.3, -bh)
      ctx.closePath()
      ctx.fillStyle = sp.finColor + 'bb'
      ctx.fill()

      // ── Pectoral fin ──
      ctx.beginPath()
      ctx.ellipse(bw * 0.1, bh * 0.2, s * 0.22, s * 0.09, 0.5 + swim * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = sp.finColor + '88'
      ctx.fill()

      // ── Shimmer on body ──
      const shimmerGrad = ctx.createRadialGradient(-bw * 0.15, -bh * 0.3, 0, 0, 0, bw)
      shimmerGrad.addColorStop(0, 'rgba(255,255,255,0.28)')
      shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.beginPath()
      ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2)
      ctx.fillStyle = shimmerGrad
      ctx.fill()

      // ── Eye ──
      const eyeX = bw * 0.58, eyeY = -bh * 0.22
      ctx.beginPath()
      ctx.arc(eyeX, eyeY, s * 0.1, 0, Math.PI * 2)
      ctx.fillStyle = '#111'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(eyeX + s * 0.03, eyeY - s * 0.03, s * 0.035, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fill()

      ctx.restore()
    }

    /* ══ MAIN LOOP ══ */
    function tick() {
      t++
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)

      // ── Caustic light rays ──
      for (let r = 0; r < 8; r++) {
        const rx = (w / 8) * r + Math.sin(t * 0.006 + r * 1.3) * 50
        const rayGrad = ctx.createLinearGradient(rx, 0, rx + 50, h * 0.75)
        rayGrad.addColorStop(0, 'rgba(0,220,255,0.055)')
        rayGrad.addColorStop(1, 'rgba(0,220,255,0)')
        ctx.beginPath()
        ctx.moveTo(rx, 0)
        ctx.lineTo(rx + 55, h * 0.75)
        ctx.lineTo(rx + 75, h * 0.75)
        ctx.lineTo(rx + 20, 0)
        ctx.fillStyle = rayGrad
        ctx.fill()
      }

      // ── Water shimmer top ──
      const shimTop = ctx.createLinearGradient(0, 0, 0, 30)
      shimTop.addColorStop(0, 'rgba(0,200,255,0.14)')
      shimTop.addColorStop(1, 'rgba(0,200,255,0)')
      ctx.fillStyle = shimTop
      ctx.fillRect(0, 0, w, 30)

      // ── Sand bottom ──
      const sandGrad = ctx.createLinearGradient(0, h - 55, 0, h)
      sandGrad.addColorStop(0, 'oklch(0.28 0.05 65 / 0.95)')
      sandGrad.addColorStop(1, 'oklch(0.20 0.04 55)')
      ctx.fillStyle = sandGrad
      ctx.beginPath()
      ctx.moveTo(0, h)
      ctx.lineTo(0, h - 45)
      for (let x = 0; x <= w; x += 30) {
        const waveY = h - 42 + Math.sin(x * 0.04 + t * 0.004) * 5
        ctx.lineTo(x, waveY)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      // ── Rocks ──
      rocks.forEach(rock => {
        ctx.save()
        ctx.translate(rock.x, rock.y)
        ctx.rotate(rock.angle)
        // shadow
        ctx.beginPath()
        ctx.ellipse(2, 4, rock.rx, rock.ry * 0.5, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.fill()
        // rock body
        ctx.beginPath()
        ctx.ellipse(0, 0, rock.rx, rock.ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = rock.color
        ctx.fill()
        // rock highlight
        ctx.beginPath()
        ctx.ellipse(-rock.rx * 0.25, -rock.ry * 0.3, rock.rx * 0.35, rock.ry * 0.25, -0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fill()
        ctx.restore()
      })

      // ── Plants ──
      plants.forEach(p => {
        const baseY = h - 42 + Math.sin(p.x * 0.04) * 4
        ctx.globalAlpha = 1
        if (p.type === 'anubias')    drawAnubias(p.x, baseY, p.phase, p.speed, p.height, p.color)
        else if (p.type === 'javafern') drawJavaFern(p.x, baseY, p.phase, p.speed, p.height, p.color)
        else if (p.type === 'vallisneria') drawVallisneria(p.x, baseY, p.phase, p.speed, p.height, p.color)
        else drawRotala(p.x, baseY, p.phase, p.speed, p.height, p.color)
        ctx.globalAlpha = 1
      })

      // ── Bubbles ──
      bubbles.forEach(b => {
        b.y -= b.speed
        if (b.y < -12) { b.y = h + 12; b.x = Math.random() * w }
        const wx = b.x + Math.sin(t * 0.02 * b.wobble + b.phase) * 10
        ctx.beginPath()
        ctx.arc(wx, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(160,220,255,0.45)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(wx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.38)'
        ctx.fill()
      })

      // ── Deep water vignette at bottom ──
      const vignette = ctx.createLinearGradient(0, h * 0.6, 0, h)
      vignette.addColorStop(0, 'rgba(4,20,25,0)')
      vignette.addColorStop(1, 'rgba(4,20,25,0.55)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, h * 0.6, w, h * 0.4)

      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 w-full h-full"
      aria-hidden
    />
  )
}

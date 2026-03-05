'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { WaterCanvas } from './WaterCanvas'
import { FishAnimation } from './FishAnimation'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Deep ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[oklch(0.10_0.03_210)] to-[oklch(0.08_0.025_200)]" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.52_0.1_195_/_25%),transparent)]" />

      {/* Animated water + fish */}
      <WaterCanvas />
      <FishAnimation />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🐠 Peces pre-desparasitados · Caldas, Antioquia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          >
            El Imperio
            <br />
            <span className="gradient-text">del Agua</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            Peces ornamentales, plantas acuáticas y equipos de calidad.
            Asesoría experta para crear el acuario de tus sueños.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/tienda"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/573027471832?text=Hola%2C%20quiero%20información%20sobre%20sus%20peces"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3.5 font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4 text-green-400" />
              Asesoría por WhatsApp
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: '200+', label: 'Especies' },
              { value: '100%', label: 'Pre-desparasitados' },
              { value: '5+', label: 'Años de experiencia' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground/50"
      >
        <div className="h-8 w-5 rounded-full border border-current flex items-start justify-center p-1">
          <div className="h-1.5 w-1 rounded-full bg-current" />
        </div>
      </motion.div>
    </section>
  )
}

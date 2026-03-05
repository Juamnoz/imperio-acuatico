'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { WaterCanvas } from './WaterCanvas'
import { FishCanvas } from './FishCanvas'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-start overflow-hidden">
      {/* Deep ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.09_0.025_210)] via-[oklch(0.10_0.03_210)] to-[oklch(0.07_0.02_200)]" />

      {/* Radial glow top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,oklch(0.52_0.1_195_/_20%),transparent)]" />

      {/* Aquarium environment: rocks, plants, bubbles, sand */}
      <WaterCanvas />

      {/* PixiJS-style fish sprites — Option A */}
      <FishCanvas />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-6 pt-24 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="-mb-6"
          >
            <Image
              src="/logo-white.png"
              alt="Imperio Acuático"
              width={600}
              height={180}
              className="h-44 w-auto object-contain md:h-52 -ml-6"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: 'easeOut' }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🐠 Peces pre-desparasitados · Caldas, Antioquia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="mt-2 font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
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

      {/* Scroll indicator — pecesito */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <motion.svg
          width="36" height="28" viewBox="0 0 36 28" fill="none"
          animate={{ scaleX: [1, 1.05, 1], rotate: [-3, 3, -3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="opacity-60 drop-shadow-[0_0_6px_rgba(0,220,255,0.5)]"
        >
          {/* tail */}
          <motion.path
            d="M6 14 L0 6 L0 22 Z"
            fill="#00D4D4"
            animate={{ d: ['M6 14 L0 6 L0 22 Z', 'M6 14 L0 9 L0 19 Z', 'M6 14 L0 6 L0 22 Z'] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* body */}
          <ellipse cx="19" cy="14" rx="14" ry="8" fill="#00B4CC" />
          {/* belly */}
          <ellipse cx="17" cy="16" rx="10" ry="4" fill="#00D4D4" opacity="0.5" />
          {/* dorsal fin */}
          <path d="M13 6 Q19 1 25 6" stroke="#009999" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* shimmer */}
          <ellipse cx="15" cy="11" rx="5" ry="3" fill="white" opacity="0.2" />
          {/* eye */}
          <circle cx="30" cy="12" r="2.5" fill="#0a0a0a" />
          <circle cx="31" cy="11" r="0.9" fill="white" />
        </motion.svg>
        {/* arrow down */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="w-px h-5 bg-gradient-to-b from-cyan-400/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

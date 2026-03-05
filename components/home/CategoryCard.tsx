'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

/* ─── SVG icons per category slug ─── */
function FishOrnamentalIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9"
      animate={{ x: [0, 3, -3, 3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* tail */}
      <motion.path d="M6 20 L1 13 L1 27 Z" fill="#00D4CC"
        animate={{ scaleX: [1, 0.7, 1], originX: '6px' }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      {/* body */}
      <ellipse cx="22" cy="20" rx="14" ry="9" fill="#00B4D8" />
      {/* belly stripe */}
      <ellipse cx="20" cy="22" rx="10" ry="4.5" fill="#0096C7" opacity="0.6" />
      {/* dorsal fin */}
      <path d="M14 11 Q20 5 27 11" stroke="#0077B6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* shimmer */}
      <ellipse cx="18" cy="16" rx="5" ry="3" fill="white" opacity="0.25" />
      {/* eye */}
      <circle cx="33" cy="18" r="2.8" fill="#0a0a1a" />
      <circle cx="34" cy="17" r="1" fill="white" />
    </motion.svg>
  )
}

function CiclidoAfricanoIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9"
      animate={{ x: [0, -3, 3, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* tail forked */}
      <path d="M7 20 L1 14 L4 20 L1 26 Z" fill="#F77F00" />
      {/* body */}
      <ellipse cx="22" cy="20" rx="14" ry="9" fill="#F4A261" />
      {/* vertical stripes */}
      <path d="M15 12 Q16 20 15 28" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M21 11 Q22 20 21 29" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M27 12 Q28 20 27 28" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      {/* dorsal fin */}
      <path d="M13 12 Q20 5 28 12" stroke="#E76F51" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M13 12 Q20 8 28 12" fill="#F4A261" opacity="0.5"/>
      {/* shimmer */}
      <ellipse cx="19" cy="17" rx="5" ry="3" fill="white" opacity="0.2"/>
      {/* eye */}
      <circle cx="33" cy="18" r="2.8" fill="#1a0a00"/>
      <circle cx="34" cy="17" r="1" fill="white"/>
    </motion.svg>
  )
}

function CiclidoAmericanoIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9"
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* discus — round body */}
      <ellipse cx="20" cy="20" rx="13" ry="16" fill="#7B2D8B" />
      <ellipse cx="20" cy="20" rx="10" ry="13" fill="#9B59B6" />
      {/* vertical bands */}
      <path d="M20 4 Q21 20 20 36" stroke="#6C3483" strokeWidth="3" opacity="0.5"/>
      <path d="M13 7 Q15 20 13 33" stroke="#6C3483" strokeWidth="2" opacity="0.4"/>
      <path d="M27 7 Q25 20 27 33" stroke="#6C3483" strokeWidth="2" opacity="0.4"/>
      {/* dorsal/ventral fins */}
      <path d="M11 5 Q20 2 29 5 L28 11 Q20 8 12 11 Z" fill="#7B2D8B" opacity="0.8"/>
      <path d="M11 35 Q20 38 29 35 L28 29 Q20 32 12 29 Z" fill="#7B2D8B" opacity="0.8"/>
      {/* tail */}
      <path d="M33 20 L39 14 L39 26 Z" fill="#8E44AD"/>
      {/* shimmer */}
      <ellipse cx="16" cy="15" rx="4" ry="5" fill="white" opacity="0.2"/>
      {/* eye */}
      <circle cx="10" cy="20" r="2.5" fill="#1a001a"/>
      <circle cx="9" cy="19" r="0.9" fill="white"/>
    </motion.svg>
  )
}

function PecesLimpiadoresIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9"
      animate={{ y: [0, -2, 0], x: [0, 2, -1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* pleco — armored body */}
      <path d="M4 24 Q12 16 30 18 Q36 20 35 24 Q34 28 28 30 Q14 34 4 24Z" fill="#5D4037"/>
      {/* armor plates */}
      <path d="M10 20 Q14 18 18 20 Q14 22 10 20Z" fill="#795548" opacity="0.7"/>
      <path d="M18 19 Q22 17 26 19 Q22 21 18 19Z" fill="#795548" opacity="0.7"/>
      <path d="M14 24 Q18 22 22 24 Q18 26 14 24Z" fill="#795548" opacity="0.7"/>
      <path d="M22 23 Q26 21 29 23 Q26 25 22 23Z" fill="#795548" opacity="0.7"/>
      {/* dorsal fin */}
      <path d="M12 17 Q18 10 26 16" stroke="#4E342E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* tail */}
      <path d="M4 24 L0 18 L0 30 Z" fill="#4E342E"/>
      {/* sucker mouth */}
      <circle cx="34" cy="24" r="3" fill="#3E2723"/>
      <circle cx="34" cy="24" r="1.5" fill="#1a0a00"/>
      {/* eye */}
      <circle cx="30" cy="20" r="2" fill="#1a0a00"/>
      <circle cx="29" cy="19" r="0.7" fill="white"/>
      {/* spots */}
      <circle cx="16" cy="26" r="1" fill="#6D4C41" opacity="0.6"/>
      <circle cx="22" cy="27" r="1" fill="#6D4C41" opacity="0.6"/>
    </motion.svg>
  )
}

function PlantasIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* stem */}
      <motion.path d="M20 36 Q20 26 20 18" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round"
        animate={{ d: ['M20 36 Q20 26 20 18', 'M20 36 Q21 26 19 18', 'M20 36 Q19 26 21 18', 'M20 36 Q20 26 20 18'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* left leaf */}
      <motion.path d="M20 24 Q10 18 8 10 Q14 12 20 24Z" fill="#52B788"
        animate={{ rotate: [-5, 5, -5], originX: '20px', originY: '24px' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* right leaf */}
      <motion.path d="M20 20 Q30 14 32 6 Q26 9 20 20Z" fill="#40916C"
        animate={{ rotate: [5, -5, 5], originX: '20px', originY: '20px' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* top leaf */}
      <motion.path d="M20 14 Q16 6 20 2 Q24 6 20 14Z" fill="#74C69D"
        animate={{ scaleY: [1, 1.1, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* bubbles */}
      <motion.circle cx="26" cy="28" r="1.5" fill="#90E0EF" opacity="0.7"
        animate={{ y: [0, -6], opacity: [0.7, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
      />
      <motion.circle cx="14" cy="30" r="1" fill="#90E0EF" opacity="0.6"
        animate={{ y: [0, -5], opacity: [0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
      />
    </motion.svg>
  )
}

function EquiposIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* filter body */}
      <rect x="12" y="6" width="16" height="26" rx="4" fill="#023E8A" />
      <rect x="14" y="8" width="12" height="22" rx="3" fill="#0077B6" />
      {/* intake/output tubes */}
      <rect x="6" y="10" width="6" height="3" rx="1.5" fill="#48CAE4" />
      <rect x="28" y="10" width="6" height="3" rx="1.5" fill="#48CAE4" />
      {/* flow lines inside */}
      <line x1="18" y1="13" x2="18" y2="26" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="22" y1="13" x2="22" y2="26" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* spinning impeller */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '20px 20px' }}
      >
        <circle cx="20" cy="20" r="4" fill="#48CAE4"/>
        <path d="M20 16 L21 20 L20 24 L19 20 Z" fill="#0096C7"/>
        <path d="M16 20 L20 19 L24 20 L20 21 Z" fill="#0096C7"/>
      </motion.g>
      {/* LED indicator */}
      <motion.circle cx="20" cy="9" r="1.5" fill="#00F5FF"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.svg>
  )
}

function AlimentosIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* pellets falling */}
      <motion.circle cx="12" cy="8" r="4" fill="#F4A261"
        animate={{ y: [0, 24], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn', delay: 0 }}
      />
      <motion.circle cx="20" cy="6" r="3.5" fill="#E76F51"
        animate={{ y: [0, 26], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn', delay: 0.4 }}
      />
      <motion.circle cx="28" cy="8" r="4" fill="#F4A261"
        animate={{ y: [0, 24], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn', delay: 0.8 }}
      />
      <motion.circle cx="16" cy="5" r="3" fill="#FFDDD2"
        animate={{ y: [0, 28], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn', delay: 1.2 }}
      />
      <motion.circle cx="25" cy="4" r="3" fill="#E76F51"
        animate={{ y: [0, 28], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn', delay: 1.6 }}
      />
      {/* water surface */}
      <motion.path d="M4 34 Q10 30 16 34 Q22 38 28 34 Q34 30 40 34"
        stroke="#48CAE4" strokeWidth="2" fill="none" strokeLinecap="round"
        animate={{ d: [
          'M4 34 Q10 30 16 34 Q22 38 28 34 Q34 30 40 34',
          'M4 34 Q10 38 16 34 Q22 30 28 34 Q34 38 40 34',
          'M4 34 Q10 30 16 34 Q22 38 28 34 Q34 30 40 34',
        ]}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  )
}

function AcuariosIcon() {
  return (
    <motion.svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
      {/* tank glass */}
      <rect x="3" y="8" width="34" height="26" rx="3" stroke="#48CAE4" strokeWidth="2" fill="#023E8A" fillOpacity="0.3"/>
      {/* sand bottom */}
      <ellipse cx="20" cy="32" rx="15" ry="3" fill="#D4A574" opacity="0.6"/>
      {/* water surface shimmer */}
      <motion.path d="M5 14 Q10 11 15 14 Q20 17 25 14 Q30 11 35 14"
        stroke="#90E0EF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"
        animate={{ d: [
          'M5 14 Q10 11 15 14 Q20 17 25 14 Q30 11 35 14',
          'M5 14 Q10 17 15 14 Q20 11 25 14 Q30 17 35 14',
          'M5 14 Q10 11 15 14 Q20 17 25 14 Q30 11 35 14',
        ]}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* tiny fish inside */}
      <motion.g
        animate={{ x: [0, 20, 20, 0, 0], scaleX: [1, 1, -1, -1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.5, 0.9, 1] }}
      >
        <ellipse cx="10" cy="23" rx="5" ry="3" fill="#F4A261"/>
        <path d="M5 23 L3 20 L3 26 Z" fill="#E76F51"/>
        <circle cx="14" cy="22" r="1" fill="#1a0a00"/>
      </motion.g>
      {/* plant */}
      <path d="M28 31 Q26 24 29 18" stroke="#52B788" strokeWidth="2" strokeLinecap="round"/>
      <path d="M29 22 Q24 18 25 14" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round"/>
      {/* bubble */}
      <motion.circle cx="22" cy="25" r="1.5" stroke="#90E0EF" strokeWidth="1" fill="none"
        animate={{ y: [0, -10], opacity: [0.8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
      />
    </motion.svg>
  )
}

const iconMap: Record<string, React.ReactNode> = {
  'peces-ornamentales': <FishOrnamentalIcon />,
  'ciclidos-africanos': <CiclidoAfricanoIcon />,
  'ciclidos-americanos': <CiclidoAmericanoIcon />,
  'peces-limpiadores': <PecesLimpiadoresIcon />,
  'plantas-acuaticas': <PlantasIcon />,
  'equipos': <EquiposIcon />,
  'alimentos': <AlimentosIcon />,
  'acuarios-combos': <AcuariosIcon />,
}

/* ─── Card ─── */
interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
}

export function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const icon = iconMap[cat.slug]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link
        href={`/tienda?categoria=${cat.slug}`}
        className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 p-5 text-center transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
      >
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all group-hover:bg-primary/20"
          whileHover={{ scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {icon ?? <span className="text-3xl">{cat.icon ?? '🐠'}</span>}
        </motion.div>
        <div>
          <p className="font-semibold text-sm text-foreground leading-tight">{cat.name}</p>
          {cat.description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{cat.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

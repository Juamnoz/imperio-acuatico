'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Fish, Leaf, Settings, Utensils, Waves, Package } from 'lucide-react'

const categories = [
  {
    name: 'Peces Ornamentales',
    slug: 'peces-ornamentales',
    icon: Fish,
    description: 'Amazónicos, tropicales, importados',
    subcategories: ['Amazónicos', 'Tropicales', 'Importados', 'Bettas'],
  },
  {
    name: 'Cíclidos',
    slug: 'ciclidos-africanos',
    icon: Fish,
    description: 'Africanos y americanos',
    subcategories: ['Africanos', 'Americanos', 'Flowerhorn', 'Discus'],
  },
  {
    name: 'Peces Limpiadores',
    slug: 'peces-limpiadores',
    icon: Waves,
    description: 'Plecostomus, corydoras y más',
    subcategories: ['Plecostomus', 'Corydoras', 'Otocinclus', 'Ancistrus'],
  },
  {
    name: 'Plantas Acuáticas',
    slug: 'plantas-acuaticas',
    icon: Leaf,
    description: 'Bajo, medio y alto requerimiento',
    subcategories: ['Bajo requerimiento', 'Medio requerimiento', 'Alto requerimiento', 'CO₂ y sustratos'],
  },
  {
    name: 'Equipos',
    slug: 'equipos',
    icon: Settings,
    description: 'Filtros, termostatos, iluminación',
    subcategories: ['Filtros', 'Termostatos', 'Iluminación', 'Accesorios'],
  },
  {
    name: 'Alimentos',
    slug: 'alimentos',
    icon: Utensils,
    description: 'Especializados por especie',
    subcategories: ['Pellets', 'Vivos y liofilizados', 'Vegetales', 'Para crías'],
  },
  {
    name: 'Acuarios y Combos',
    slug: 'acuarios-combos',
    icon: Package,
    description: 'Kits completos para empezar',
    subcategories: ['Combos starter', 'Peceras', 'Decoración', 'Troncos y rocas'],
  },
]

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-30 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-40 glass border-t border-border shadow-2xl shadow-black/40"
          >
            <div className="container mx-auto max-w-7xl px-6 py-8">
              <div className="grid grid-cols-4 gap-6">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <Link
                      key={cat.slug}
                      href={`/tienda?categoria=${cat.slug}`}
                      onClick={onClose}
                      className="group rounded-xl p-4 transition-colors hover:bg-primary/10"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <li key={sub} className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                            → {sub}
                          </li>
                        ))}
                      </ul>
                    </Link>
                  )
                })}
                {/* CTA card */}
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 p-4 border border-primary/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Destacados</p>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">Peces pre-desparasitados</h3>
                  <p className="text-xs text-muted-foreground mb-3">Todos nuestros peces incluyen protocolo de aclimatación.</p>
                  <Link
                    href="/tienda?featured=true"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Ver destacados →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

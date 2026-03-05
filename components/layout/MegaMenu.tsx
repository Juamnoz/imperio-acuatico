'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Fish, Leaf, Settings, Utensils, Waves, Package, ChevronRight, Sparkles } from 'lucide-react'

/* ─── Category sidebar data ─── */
const categories = [
  { name: 'Peces Ornamentales', slug: 'peces-ornamentales', icon: Fish,     description: 'Amazónicos, tropicales e importados' },
  { name: 'Cíclidos',           slug: 'ciclidos-africanos', icon: Fish,     description: 'Africanos y americanos' },
  { name: 'Peces Limpiadores',  slug: 'peces-limpiadores',  icon: Waves,    description: 'Plecostomus, corydoras y más' },
  { name: 'Plantas Acuáticas',  slug: 'plantas-acuaticas',  icon: Leaf,     description: 'Bajo, medio y alto requerimiento' },
  { name: 'Equipos',            slug: 'equipos',            icon: Settings, description: 'Filtros, termostatos, iluminación' },
  { name: 'Alimentos',          slug: 'alimentos',          icon: Utensils, description: 'Especializados por especie' },
  { name: 'Acuarios y Combos',  slug: 'acuarios-combos',    icon: Package,  description: 'Kits completos para empezar' },
]

/* ─── Types ─── */
interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string
}

type ProductCache = Record<string, Product[]>

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

function getFirstImage(images: string): string {
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) && arr[0] ? arr[0] : '/placeholder-fish.jpg'
  } catch {
    return '/placeholder-fish.jpg'
  }
}

/* ─── Props ─── */
interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [activeSlug, setActiveSlug] = useState(categories[0].slug)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [cache, setCache] = useState<ProductCache>({})

  const fetchProducts = useCallback(async (slug: string) => {
    if (cache[slug]) { setProducts(cache[slug]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/products?categoria=${slug}&limit=4`)
      const data: Product[] = await res.json()
      setCache(prev => ({ ...prev, [slug]: data }))
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [cache])

  // Fetch on open or category change
  useEffect(() => {
    if (isOpen) fetchProducts(activeSlug)
  }, [isOpen, activeSlug, fetchProducts])

  // Reset to first category when menu closes
  useEffect(() => {
    if (!isOpen) setActiveSlug(categories[0].slug)
  }, [isOpen])

  const activeCategory = categories.find(c => c.slug === activeSlug)!

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-20 z-30 bg-black/50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-40 glass border-t border-border shadow-2xl shadow-black/50"
          >
            <div className="container mx-auto max-w-7xl flex" style={{ minHeight: 380 }}>

              {/* ── Left sidebar ── */}
              <div className="w-56 shrink-0 border-r border-border/50 py-4">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const active = cat.slug === activeSlug
                  return (
                    <button
                      key={cat.slug}
                      onMouseEnter={() => setActiveSlug(cat.slug)}
                      onClick={() => { onClose() }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 group
                        ${active ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
                        ${active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium leading-tight">{cat.name}</span>
                      {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  )
                })}

                {/* Ver todo */}
                <div className="mt-3 px-4 pt-3 border-t border-border/50">
                  <Link
                    href="/tienda"
                    onClick={onClose}
                    className="flex items-center gap-2 text-xs text-primary font-medium hover:underline"
                  >
                    Ver toda la tienda →
                  </Link>
                </div>
              </div>

              {/* ── Right: products ── */}
              <div className="flex-1 px-8 py-6">
                {/* Header */}
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-0.5">
                      Más populares
                    </p>
                    <h3 className="text-lg font-bold text-foreground">
                      {activeCategory.name}
                    </h3>
                  </div>
                  <Link
                    href={`/tienda?categoria=${activeSlug}`}
                    onClick={onClose}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Ver todos →
                  </Link>
                </div>

                {/* Product grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlug}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="rounded-xl bg-white/5 animate-pulse h-48" />
                        ))
                      : products.length > 0
                      ? products.map((product) => {
                          const img = getFirstImage(product.images)
                          return (
                            <Link
                              key={product.id}
                              href={`/tienda/${product.slug}`}
                              onClick={onClose}
                              className="group rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/40 hover:bg-card transition-all duration-200"
                            >
                              <div className="relative h-32 bg-black/20 overflow-hidden">
                                <Image
                                  src={img}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="160px"
                                />
                              </div>
                              <div className="p-3">
                                <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1.5">
                                  {product.name}
                                </p>
                                <p className="text-sm font-bold text-primary">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </Link>
                          )
                        })
                      : (
                          <div className="col-span-4 flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Fish className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm">Sin productos disponibles</p>
                          </div>
                        )
                    }
                  </motion.div>
                </AnimatePresence>

                {/* Bottom promo strip */}
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Todos nuestros peces</span> incluyen protocolo de pre-desparasitación y aclimatación.
                  </p>
                  <Link
                    href="/nosotros"
                    onClick={onClose}
                    className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline"
                  >
                    Saber más
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

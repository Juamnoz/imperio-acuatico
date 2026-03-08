'use client'

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface CatalogFiltersProps {
  categories: Category[]
  children: ReactNode
}

const TEMPERAMENTS = [
  { value: 'pasivo', label: 'Pasivo', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { value: 'semi', label: 'Semi-agresivo', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { value: 'agresivo', label: 'Agresivo', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
]

const CARE_LEVELS = [
  { value: 'fácil', label: 'Fácil', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { value: 'medio', label: 'Medio', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { value: 'difícil', label: 'Difícil', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
]

const SORT_OPTIONS = [
  { value: '', label: 'Destacados primero' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc', label: 'A – Z' },
  { value: 'newest', label: 'Más recientes' },
]

function SortDropdown({
  value,
  onChange,
  size = 'sm',
}: {
  value: string
  onChange: (v: string) => void
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? SORT_OPTIONS[0].label

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border bg-card/80 font-medium text-foreground transition-colors hover:border-primary/30',
          size === 'md' ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs',
        )}
      >
        {size === 'sm' && <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
        {activeLabel}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors',
                  opt.value === value
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Check className={cn('h-3.5 w-3.5 shrink-0', opt.value === value ? 'opacity-100' : 'opacity-0')} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CatalogFilters({ categories, children }: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Read current filters from URL
  const activeCategory = searchParams.get('categoria') ?? ''
  const activeTemperament = searchParams.get('temperamento') ?? ''
  const activeCareLevel = searchParams.get('cuidado') ?? ''
  const activeSort = searchParams.get('orden') ?? ''
  const activeFeatured = searchParams.get('featured') === 'true'
  const activePriceMin = searchParams.get('precio_min') ?? ''
  const activePriceMax = searchParams.get('precio_max') ?? ''

  const activeFilterCount = [
    activeCategory,
    activeTemperament,
    activeCareLevel,
    activeFeatured ? 'true' : '',
    activePriceMin,
    activePriceMax,
  ].filter(Boolean).length

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      startTransition(() => {
        router.push(`/tienda?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams],
  )

  const clearAllFilters = () => {
    setSearchValue('')
    startTransition(() => {
      router.push('/tienda', { scroll: false })
    })
  }

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.get('q') ?? ''
      if (searchValue !== current) {
        updateFilters({ q: searchValue })
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchValue, searchParams, updateFilters])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleFilter = (key: string, value: string) => {
    const current = searchParams.get(key)
    updateFilters({ [key]: current === value ? '' : value })
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nombre, especie..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-xl border border-border bg-card/80 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorías</p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilters({ categoria: '' })}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors',
                !activeCategory
                  ? 'bg-primary/15 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              Todos
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilters({ categoria: activeCategory === cat.slug ? '' : cat.slug })}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2 text-sm transition-colors',
                  activeCategory === cat.slug
                    ? 'bg-primary/15 font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Temperament */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temperamento</p>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENTS.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleFilter('temperamento', t.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                activeTemperament === t.value
                  ? t.color
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Care level */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nivel de cuidado</p>
        <div className="flex flex-wrap gap-2">
          {CARE_LEVELS.map((c) => (
            <button
              key={c.value}
              onClick={() => toggleFilter('cuidado', c.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                activeCareLevel === c.value
                  ? c.color
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rango de precio</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={activePriceMin}
            onChange={(e) => updateFilters({ precio_min: e.target.value })}
            className="w-full rounded-lg border border-border bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          <span className="text-muted-foreground text-xs shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={activePriceMax}
            onChange={(e) => updateFilters({ precio_max: e.target.value })}
            className="w-full rounded-lg border border-border bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Featured only */}
      <div>
        <button
          onClick={() => updateFilters({ featured: activeFeatured ? '' : 'true' })}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
            activeFeatured
              ? 'border-accent/40 bg-accent/10 text-accent'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20',
          )}
        >
          <Sparkles className="h-4 w-4" />
          Solo destacados
        </button>
      </div>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full rounded-xl border border-destructive/30 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Limpiar filtros ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className={cn('sticky top-24 transition-opacity', isPending && 'opacity-60')}>
            <FilterContent />
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Mobile: filter button + sort */}
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <SortDropdown
              value={activeSort}
              onChange={(v) => updateFilters({ orden: v })}
              size="md"
            />
          </div>

          {/* Desktop: sort bar */}
          <div className="mb-5 hidden items-center justify-end lg:flex">
            <SortDropdown
              value={activeSort}
              onChange={(v) => updateFilters({ orden: v })}
              size="sm"
            />
          </div>

          {/* Product grid (passed as children) */}
          <div className={cn('transition-opacity', isPending && 'opacity-60')}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-background border-r border-border p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">Filtros</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 pb-6">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Ver resultados
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

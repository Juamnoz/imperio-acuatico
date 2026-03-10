'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Search, X, Loader2, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatPrice, getFirstImage } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import type { ProductWithCategory } from '@/lib/types'

export function SearchSheet() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem } = useCartStore()

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Keyboard shortcut: Cmd+K / Ctrl+K + custom event from MobileNav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const openHandler = () => setOpen(true)
    document.addEventListener('keydown', handler)
    document.addEventListener('open-search', openHandler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('open-search', openHandler)
    }
  }, [])

  // Debounced search
  const searchProducts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}&limit=12`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => searchProducts(query), 350)
    return () => clearTimeout(timeout)
  }, [query, searchProducts])

  const handleClose = () => {
    setOpen(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  const handleAddToCart = (product: ProductWithCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getFirstImage(product.images),
      slug: product.slug,
    })
  }

  return (
    <>
      {/* Trigger button — desktop only (mobile uses MobileNav) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 hidden md:flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50"
        aria-label="Buscar productos"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Sheet overlay + panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Panel from bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-border bg-background shadow-2xl md:inset-x-auto md:left-1/2 md:bottom-0 md:w-full md:max-w-lg md:-translate-x-1/2"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Search input */}
              <div className="px-5 pb-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar peces, plantas, accesorios..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {query ? (
                    <button
                      onClick={() => { setQuery(''); inputRef.current?.focus() }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  ) : (
                    <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-5 pb-6">
                {loading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {!loading && searched && results.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-3xl mb-3">🐠</p>
                    <p className="text-sm text-muted-foreground">
                      No encontramos productos para &ldquo;{query}&rdquo;
                    </p>
                  </div>
                )}

                {!loading && !searched && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Escribe al menos 2 caracteres para buscar
                    </p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="space-y-2">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                      {results.length} resultado{results.length !== 1 && 's'}
                    </p>
                    {results.map((product) => {
                      const image = getFirstImage(product.images)
                      return (
                        <motion.a
                          key={product.id}
                          href={`/tienda/${product.slug}`}
                          onClick={handleClose}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-2.5 transition-colors hover:bg-card hover:border-primary/30"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/logo-white.png'
                              }}
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="text-[8px] font-bold text-white">AGOTADO</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-primary">{product.category.name}</p>
                            <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                            <p className="text-sm font-bold text-foreground">{formatPrice(product.price)}</p>
                          </div>

                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={product.stock === 0}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        </motion.a>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

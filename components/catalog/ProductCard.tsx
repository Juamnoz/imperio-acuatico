'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingCart, Droplets } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, getFirstImage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { QuickViewModal } from './QuickViewModal'
import type { ProductWithCategory } from '@/lib/types'
import { trackAddToCart } from '@/lib/analytics'

const temperamentColors = {
  pasivo: 'text-emerald-400 bg-emerald-400/10',
  semi: 'text-yellow-400 bg-yellow-400/10',
  agresivo: 'text-red-400 bg-red-400/10',
}

const careLevelColors = {
  'fácil': 'text-emerald-400',
  'medio': 'text-yellow-400',
  'difícil': 'text-red-400',
}

interface ProductCardProps {
  product: ProductWithCategory
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const { addItem } = useCartStore()
  const image = getFirstImage(product.images)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackAddToCart({ id: product.id, name: product.name, price: product.price, category: product.category.name })
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
      slug: product.slug,
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
        onClick={() => setIsQuickViewOpen(true)}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10">
          {/* Image */}
          <div className="relative h-36 sm:h-52 overflow-hidden bg-muted">
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/logo-white.png'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

            {product.featured && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-accent-foreground">
                Destacado
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
                {'\u00A1'}Últimas {product.stock}!
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">Agotado</span>
              </div>
            )}

            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            <p className="mb-0.5 text-[10px] sm:text-xs text-primary font-medium">{product.category.name}</p>
            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1.5 sm:mb-2 text-sm sm:text-base">
              {product.name}
            </h3>

            <div className="hidden sm:flex flex-wrap gap-1.5 mb-3">
              {product.temperament && (
                <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', temperamentColors[product.temperament as keyof typeof temperamentColors] ?? 'text-muted-foreground bg-muted')}>
                  {product.temperament}
                </span>
              )}
              {product.careLevel && (
                <span className={cn('text-[11px] font-medium flex items-center gap-1', careLevelColors[product.careLevel as keyof typeof careLevelColors] ?? 'text-muted-foreground')}>
                  <Droplets className="h-3 w-3" />
                  {product.careLevel}
                </span>
              )}
              {product.tankMin && (
                <span className="text-[11px] text-muted-foreground">
                  min. {product.tankMin}L
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm sm:text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="rounded-lg sm:rounded-xl bg-primary/10 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.stock === 0 ? 'Agotado' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  )
}

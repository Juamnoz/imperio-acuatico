'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Droplets } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, getFirstImage, parseTags } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/types'

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
  const { addItem } = useCartStore()
  const image = getFirstImage(product.images)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/tienda/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-muted">
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/images/placeholder-fish.jpg'
              }}
            />
            {/* Teal shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

            {/* Featured badge */}
            {product.featured && (
              <div className="absolute top-3 left-3 rounded-full bg-accent/90 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                Destacado
              </div>
            )}

            {/* Stock badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-3 right-3 rounded-full bg-red-500/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                ¡Últimas {product.stock}!
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">Agotado</span>
              </div>
            )}

            {/* Add to cart button (hover) */}
            <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="mb-1 text-xs text-primary font-medium">{product.category.name}</p>
            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-2">
              {product.name}
            </h3>

            {/* Attributes */}
            <div className="flex flex-wrap gap-1.5 mb-3">
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
              <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {product.stock === 0 ? 'Agotado' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Minus, Plus, Droplets, Fish, MessageCircle, ExternalLink } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, getFirstImage, parseImages, parsePriceBulk } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/types'

const temperamentLabel = {
  pasivo: { label: 'Pacífico', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  semi: { label: 'Semi-agresivo', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  agresivo: { label: 'Agresivo', color: 'text-red-400', bg: 'bg-red-400/10' },
}

interface QuickViewModalProps {
  product: ProductWithCategory
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const { addItem } = useCartStore()

  const images = parseImages(product.images)
  const mainImage = images[activeImg] || '/images/placeholder-fish.jpg'
  const bulkPrices = parsePriceBulk(product.priceBulk)
  const temperament = temperamentLabel[product.temperament as keyof typeof temperamentLabel]

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getFirstImage(product.images),
      slug: product.slug,
      quantity,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet (mobile) / centered modal (desktop) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:rounded-2xl md:border"
          >
            {/* Drag handle (mobile) */}
            <div className="sticky top-0 z-10 flex items-center justify-center bg-background pt-3 pb-2 md:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-4 md:p-6">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-card border border-border mb-4">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-fish.jpg' }}
                />
                {product.featured && (
                  <div className="absolute top-3 left-3 rounded-full bg-accent/90 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    Destacado
                  </div>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-3 right-3 rounded-full bg-red-500/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {'\u00A1'}Últimas {product.stock}!
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                        i === activeImg ? 'border-primary' : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-primary">{product.category.name}</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">{product.name}</h2>
                </div>

                {/* Attributes */}
                <div className="flex flex-wrap gap-1.5">
                  {temperament && (
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', temperament.color, temperament.bg)}>
                      {temperament.label}
                    </span>
                  )}
                  {product.careLevel && (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      {product.careLevel}
                    </span>
                  )}
                  {product.tankMin && (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <Fish className="h-3 w-3" />
                      Mín. {product.tankMin}L
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{product.description}</p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
                  <span className="text-xs text-muted-foreground">por unidad</span>
                </div>

                {bulkPrices.length > 0 && (
                  <div className="flex gap-3 text-xs">
                    {bulkPrices.map((bp) => (
                      <span key={bp.qty} className="text-muted-foreground">
                        {bp.qty}+ → <span className="font-semibold text-primary">{formatPrice(bp.price)}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quantity + Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center rounded-xl border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="flex h-10 w-10 items-center justify-center rounded-r-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                </button>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/573027471832?text=Hola%2C%20quiero%20más%20información%20sobre%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-all hover:border-green-500/50 hover:text-green-400"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <Link
                    href={`/tienda/${product.slug}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-primary/30"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver detalle completo
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

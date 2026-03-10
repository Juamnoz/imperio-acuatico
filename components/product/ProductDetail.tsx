'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Minus, Plus, Droplets, Fish, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, getFirstImage, parseImages, parsePriceBulk } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProductWithCategory } from '@/lib/types'
import { trackViewContent, trackAddToCart } from '@/lib/analytics'

const temperamentLabel = {
  pasivo: { label: 'Pacífico', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  semi: { label: 'Semi-agresivo', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  agresivo: { label: 'Agresivo', color: 'text-red-400', bg: 'bg-red-400/10' },
}

export function ProductDetail({ product }: { product: ProductWithCategory }) {
  const [quantity, setQuantity] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const { addItem } = useCartStore()

  const images = parseImages(product.images)
  const mainImage = images[activeImg] || '/images/placeholder-fish.jpg'
  const bulkPrices = parsePriceBulk(product.priceBulk)
  const temperament = temperamentLabel[product.temperament as keyof typeof temperamentLabel]

  useEffect(() => {
    trackViewContent({ id: product.id, name: product.name, price: product.price, category: product.category.name })
  }, [product.id, product.name, product.price, product.category.name])

  const handleAddToCart = () => {
    trackAddToCart({ id: product.id, name: product.name, price: product.price, category: product.category.name, quantity })
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getFirstImage(product.images),
      slug: product.slug,
      quantity,
    })
  }

  return (
    <div>
      <Link href="/tienda" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <motion.div
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-card border border-border"
          >
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              priority
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-fish.jpg' }}
            />
            {product.featured && (
              <div className="absolute top-4 left-4 rounded-full bg-accent/90 px-3 py-1 text-sm font-semibold text-accent-foreground">
                Destacado
              </div>
            )}
          </motion.div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors',
                    i === activeImg ? 'border-primary' : 'border-border hover:border-primary/50'
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Link
              href={`/tienda?categoria=${product.category.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {product.category.name}
            </Link>
            <h1 className="font-display mt-1 text-3xl font-bold text-foreground">{product.name}</h1>
          </div>

          {/* Attributes */}
          <div className="flex flex-wrap gap-2">
            {temperament && (
              <span className={cn('rounded-full px-3 py-1 text-sm font-medium', temperament.color, temperament.bg)}>
                {temperament.label}
              </span>
            )}
            {product.careLevel && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                Cuidado {product.careLevel}
              </span>
            )}
            {product.tankMin && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                <Fish className="h-3.5 w-3.5" />
                Mín. {product.tankMin}L
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Price */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              <span className="text-sm text-muted-foreground">por unidad</span>
            </div>

            {bulkPrices.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio por volumen</p>
                {bulkPrices.map((bp) => (
                  <div key={bp.qty} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{bp.qty}+ unidades</span>
                    <span className="font-semibold text-primary">{formatPrice(bp.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity + Add */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground hover:bg-muted disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>

            <a
              href={`https://wa.me/573027471832?text=Hola%2C%20quiero%20más%20información%20sobre%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3.5 font-semibold text-foreground transition-all hover:border-green-500/50 hover:text-green-400"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar disponibilidad
            </a>
          </div>

          {/* Care tips */}
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">🌊 Protocolo de aclimatación</p>
            <p>Flotar bolsa 15 min → mezclar agua 15 min → liberar pez. Todos nuestros peces llegan pre-desparasitados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

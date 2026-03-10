'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, ShoppingCart, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Tienda', href: '/tienda', icon: Store },
  { label: 'Carrito', href: '#cart', icon: ShoppingCart, isCart: true },
  { label: 'Buscar', href: '#search', icon: Search, isSearch: true },
]

export function MobileNav() {
  const pathname = usePathname()
  const { getTotalItems, toggleCart } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <nav className="fixed bottom-2 left-3 right-3 z-40 md:hidden glass border border-border rounded-2xl">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = !tab.isCart && !(tab as any).isSearch && (tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href))

          if ((tab as any).isSearch) {
            return (
              <button
                key={tab.label}
                onClick={() => document.dispatchEvent(new Event('open-search'))}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          }

          if (tab.isCart) {
            return (
              <button
                key={tab.label}
                onClick={toggleCart}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                      >
                        {totalItems > 9 ? '9+' : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

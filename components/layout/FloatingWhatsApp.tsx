'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const isCartOpen = useCartStore((s) => s.isOpen)

  useEffect(() => {
    const onOpen = () => setSearchOpen(true)
    const onClose = () => setSearchOpen(false)
    document.addEventListener('search-opened', onOpen)
    document.addEventListener('search-closed', onClose)
    return () => {
      document.removeEventListener('search-opened', onOpen)
      document.removeEventListener('search-closed', onClose)
    }
  }, [])

  const shouldHide = isCartOpen || searchOpen

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 flex items-end gap-2"
      animate={{ x: shouldHide ? 200 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <AnimatePresence>
        {showTooltip && !shouldHide && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="relative rounded-xl bg-card border border-border shadow-lg px-4 py-2.5 max-w-[200px]"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-xs text-foreground font-medium">¿Necesitas ayuda?</p>
            <p className="text-[11px] text-muted-foreground">Escríbenos por WhatsApp</p>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href="https://wa.me/573027471832?text=Hola%2C%20quiero%20información%20sobre%20sus%20productos"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all hover:scale-110 hover:shadow-green-500/40 active:scale-95"
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958a15.9 15.9 0 008.832 2.672C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.302 22.602c-.388 1.096-2.28 2.096-3.14 2.168-.784.066-1.748.094-2.822-.178a25.5 25.5 0 01-2.554-.946c-4.494-1.936-7.428-6.47-7.654-6.774-.218-.304-1.786-2.378-1.786-4.536 0-2.158 1.13-3.22 1.532-3.66.388-.424.858-.532 1.142-.532.282 0 .564.002.81.016.262.012.612-.1.958.73.358.858 1.218 2.97 1.326 3.184.108.218.18.47.036.758-.142.29-.214.47-.428.722-.218.254-.456.566-.652.76-.218.214-.444.448-.19.878.254.428 1.13 1.866 2.426 3.022 1.664 1.486 3.066 1.948 3.502 2.166.434.218.69.182.944-.11.254-.29 1.09-1.27 1.382-1.706.29-.434.58-.362.978-.218.398.146 2.53 1.194 2.964 1.412.434.218.724.326.832.508.108.18.108 1.056-.28 2.152z"/>
        </svg>
      </a>
    </motion.div>
  )
}

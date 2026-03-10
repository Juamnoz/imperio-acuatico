'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { SearchSheet } from './SearchSheet'

export function ShopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pb-20 md:pb-0 md:pt-20">
        {children}
      </main>
      <Footer />
      <SearchSheet />
      <MobileNav />
    </>
  )
}

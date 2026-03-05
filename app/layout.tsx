import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { Footer } from '@/components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Imperio Acuático — Peces Ornamentales y Accesorios',
    template: '%s | Imperio Acuático',
  },
  description:
    'Tienda especializada en peces ornamentales, plantas acuáticas y accesorios en Caldas, Antioquia. Todos los peces pre-desparasitados.',
  keywords: ['peces ornamentales', 'acuario', 'Caldas Antioquia', 'peces tropicales', 'cíclidos africanos'],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: process.env.NEXT_PUBLIC_URL ?? 'https://imperioacuatico.co',
    siteName: 'Imperio Acuático',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <Navbar />
          <CartDrawer />
          <main className="pb-16 md:pb-0 md:pt-16">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}

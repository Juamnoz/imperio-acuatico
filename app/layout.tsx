import type { Metadata } from 'next'
import { Geist, Geist_Mono, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { ShopShell } from '@/components/layout/ShopShell'
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts'
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const siteUrl = process.env.NEXT_PUBLIC_URL ?? 'https://imperioacuatico.co'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Imperio Acuático — Peces Ornamentales y Accesorios en Caldas, Antioquia',
    template: '%s | Imperio Acuático',
  },
  description:
    'Tienda especializada en peces ornamentales, plantas acuáticas y accesorios en Caldas, Antioquia. Más de 1.000 especies disponibles. Todos los peces pre-desparasitados. Envíos a todo Colombia.',
  keywords: [
    'peces ornamentales', 'acuario', 'Caldas Antioquia', 'peces tropicales',
    'cíclidos africanos', 'bettas', 'guppys', 'plantas acuáticas',
    'accesorios acuario', 'tienda de peces Colombia', 'peces Medellín',
    'pecera', 'acuarismo', 'peces de agua dulce',
  ],
  authors: [{ name: 'Imperio Acuático' }],
  creator: 'Imperio Acuático',
  publisher: 'Imperio Acuático',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: siteUrl,
    siteName: 'Imperio Acuático',
    title: 'Imperio Acuático — Peces Ornamentales y Accesorios',
    description: 'Más de 1.000 especies de peces ornamentales, plantas acuáticas y accesorios. Envíos a todo Colombia desde Caldas, Antioquia.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Imperio Acuático — Peces Ornamentales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imperio Acuático — Peces Ornamentales',
    description: 'Tienda de peces ornamentales en Caldas, Antioquia. Envíos a todo Colombia.',
    images: ['/og-image.png'],
  },
  verification: {},
  category: 'ecommerce',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo-teal.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D7377" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              '@id': siteUrl,
              name: 'Imperio Acuático',
              description: 'Tienda especializada en peces ornamentales, plantas acuáticas y accesorios en Caldas, Antioquia.',
              url: siteUrl,
              telephone: '+573027471832',
              email: 'natyjaramillo81@gmail.com',
              image: `${siteUrl}/logo-teal.png`,
              logo: `${siteUrl}/logo-teal.png`,
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Cra 48 #127sur-78',
                addressLocality: 'Caldas',
                addressRegion: 'Antioquia',
                addressCountry: 'CO',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 6.0875,
                longitude: -75.6364,
              },
              priceRange: '$$',
              currenciesAccepted: 'COP',
              paymentAccepted: 'Mercado Pago, Tarjeta de crédito, PSE, Nequi, Efectivo',
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '08:00', closes: '18:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '09:00', closes: '14:00' },
              ],
              sameAs: ['https://wa.me/573027471832'],
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AnalyticsScripts />
        <Providers>
          <ShopShell>
            {children}
          </ShopShell>
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  )
}

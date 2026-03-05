import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Imágenes locales descargadas de iNaturalist (CC BY)
const imageMap: Record<string, string[]> = {
  'guppy-macho-cola-espada':    ['/products/guppy.jpg'],
  'molly-balloon-negro':        ['/products/molly-negro.jpg'],
  'tetras-neon-x5':             ['/products/tetras-neon.jpg'],
  'betta-macho-hm-importado':   ['/products/betta.jpg'],
  'angel-tropical':             ['/products/angel.jpg'],
  'disco-aleman-blue-diamond':  ['/products/disco.jpg'],
  'aulonocara-pavo-real':       ['/products/aulonocara.jpg'],
  'pseudotropheus-zebra':       ['/products/pseudotropheus.jpg'],
  'frontosa-6-bandas':          ['/products/frontosa.jpg'],
  'flowerhorn-tailand':         ['/products/flowerhorn.jpg'],
  'jack-dempsey-electrico':     ['/products/jack-dempsey.jpg'],
  'pleco-comun':                ['/products/pleco.jpg'],
  'corydoras-panda-x3':         ['/products/corydoras.jpg'],
  'anubias-nana':               ['/products/anubias.jpg'],
  'java-fern':                  ['/products/java-fern.jpg'],
  'filtro-resun-hang-on-300':   ['/products/filtro.jpg'],
  'termostato-resun-200w':      ['/products/termostato.jpg'],
  'alimento-premium-betta-30g': ['/products/alimento-betta.jpg'],
  'lombriz-sangre-liofilizada-10g': ['/products/lombriz.jpg'],
  'combo-acuario-60l':          ['/products/combo-acuario.jpg'],
}

const categoryImages: Record<string, string> = {
  'peces-ornamentales':  '/products/guppy.jpg',
  'ciclidos-africanos':  '/products/aulonocara.jpg',
  'ciclidos-americanos': '/products/flowerhorn.jpg',
  'peces-limpiadores':   '/products/pleco.jpg',
  'plantas-acuaticas':   '/products/anubias.jpg',
  'equipos':             '/products/filtro.jpg',
  'alimentos':           '/products/alimento-betta.jpg',
  'acuarios-combos':     '/products/combo-acuario.jpg',
}

async function main() {
  console.log('📸 Actualizando imágenes con archivos locales...')

  const products = await prisma.product.findMany()

  for (const product of products) {
    const images = imageMap[product.slug] ?? ['/products/guppy.jpg']
    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(images) },
    })
    console.log(`  ✓ ${product.name}`)
  }

  for (const [slug, image] of Object.entries(categoryImages)) {
    await prisma.category.update({ where: { slug }, data: { image } }).catch(() => {})
  }

  console.log('\n✅ Imágenes actualizadas con archivos locales!')
}

main().finally(() => prisma.$disconnect())

import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

// Wikimedia Commons — fotos verificadas y etiquetadas por especie
const WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb'

const imageMap: Record<string, string[]> = {
  'guppy-macho-cola-espada': [
    `${WM}/9/94/Poecilia_reticulata.jpg/640px-Poecilia_reticulata.jpg`,
  ],
  'molly-balloon-negro': [
    `${WM}/e/e9/Black_molly.jpg/640px-Black_molly.jpg`,
  ],
  'tetras-neon-x5': [
    `${WM}/3/3c/Paracheirodon_innesi.jpg/640px-Paracheirodon_innesi.jpg`,
  ],
  'betta-macho-hm-importado': [
    `${WM}/5/55/Betta_splendens.jpg/640px-Betta_splendens.jpg`,
  ],
  'angel-tropical': [
    `${WM}/8/8d/Pterophyllum_scalare.jpg/640px-Pterophyllum_scalare.jpg`,
  ],
  'disco-aleman-blue-diamond': [
    `${WM}/e/e2/Discus_fish_Wild_caught.jpg/640px-Discus_fish_Wild_caught.jpg`,
  ],
  'aulonocara-pavo-real': [
    `${WM}/f/f1/Aulonocara_nyassae.jpg/640px-Aulonocara_nyassae.jpg`,
  ],
  'pseudotropheus-zebra': [
    `${WM}/3/36/Pseudotropheus_zebra.jpg/640px-Pseudotropheus_zebra.jpg`,
  ],
  'frontosa-6-bandas': [
    `${WM}/b/ba/Cyphotilapia_frontosa.jpg/640px-Cyphotilapia_frontosa.jpg`,
  ],
  'flowerhorn-tailand': [
    `${WM}/b/bc/Flowerhorn_fish.jpg/640px-Flowerhorn_fish.jpg`,
  ],
  'jack-dempsey-electrico': [
    `${WM}/d/d1/Rocio_octofasciata1.jpg/640px-Rocio_octofasciata1.jpg`,
  ],
  'pleco-comun': [
    `${WM}/4/44/Hypostomus_plecostomus2.jpg/640px-Hypostomus_plecostomus2.jpg`,
  ],
  'corydoras-panda-x3': [
    `${WM}/5/5f/Corydoras_panda.jpg/640px-Corydoras_panda.jpg`,
  ],
  'anubias-nana': [
    `${WM}/a/a6/Anubias_barteri_var._nana.jpg/640px-Anubias_barteri_var._nana.jpg`,
  ],
  'java-fern': [
    `${WM}/5/52/Microsorum_pteropus.jpg/640px-Microsorum_pteropus.jpg`,
  ],
  'filtro-resun-hang-on-300': [
    `${WM}/1/1e/Hang-on_aquarium_filter.jpg/640px-Hang-on_aquarium_filter.jpg`,
  ],
  'termostato-resun-200w': [
    `${WM}/c/c4/Aquarium_heater.jpg/640px-Aquarium_heater.jpg`,
  ],
  'alimento-premium-betta-30g': [
    `${WM}/6/65/Betta_splendens_2.jpg/640px-Betta_splendens_2.jpg`,
  ],
  'lombriz-sangre-liofilizada-10g': [
    `${WM}/7/79/Chironomus_plumosus_larva.jpg/640px-Chironomus_plumosus_larva.jpg`,
  ],
  'combo-acuario-60l': [
    `${WM}/e/e9/Planted_aquarium.jpg/640px-Planted_aquarium.jpg`,
  ],
}

// Fallback confiables por categoría
const categoryFallbacks: Record<string, string> = {
  'peces-ornamentales': `${WM}/9/94/Poecilia_reticulata.jpg/640px-Poecilia_reticulata.jpg`,
  'ciclidos-africanos': `${WM}/f/f1/Aulonocara_nyassae.jpg/640px-Aulonocara_nyassae.jpg`,
  'ciclidos-americanos': `${WM}/b/bc/Flowerhorn_fish.jpg/640px-Flowerhorn_fish.jpg`,
  'peces-limpiadores': `${WM}/4/44/Hypostomus_plecostomus2.jpg/640px-Hypostomus_plecostomus2.jpg`,
  'plantas-acuaticas': `${WM}/a/a6/Anubias_barteri_var._nana.jpg/640px-Anubias_barteri_var._nana.jpg`,
  'equipos': `${WM}/e/e9/Planted_aquarium.jpg/640px-Planted_aquarium.jpg`,
  'alimentos': `${WM}/5/55/Betta_splendens.jpg/640px-Betta_splendens.jpg`,
  'acuarios-combos': `${WM}/e/e9/Planted_aquarium.jpg/640px-Planted_aquarium.jpg`,
}

async function main() {
  console.log('📸 Actualizando imágenes con Wikimedia Commons...')

  const products = await prisma.product.findMany({ include: { category: true } })

  for (const product of products) {
    const images = imageMap[product.slug]
      ?? [categoryFallbacks[product.category.slug] ?? `${WM}/e/e9/Planted_aquarium.jpg/640px-Planted_aquarium.jpg`]

    await prisma.product.update({
      where: { id: product.id },
      data: { images: JSON.stringify(images) },
    })
    console.log(`  ✓ ${product.name}`)
  }

  const categoryImages: Record<string, string> = {
    'peces-ornamentales': `${WM}/9/94/Poecilia_reticulata.jpg/320px-Poecilia_reticulata.jpg`,
    'ciclidos-africanos': `${WM}/f/f1/Aulonocara_nyassae.jpg/320px-Aulonocara_nyassae.jpg`,
    'ciclidos-americanos': `${WM}/b/bc/Flowerhorn_fish.jpg/320px-Flowerhorn_fish.jpg`,
    'peces-limpiadores': `${WM}/4/44/Hypostomus_plecostomus2.jpg/320px-Hypostomus_plecostomus2.jpg`,
    'plantas-acuaticas': `${WM}/a/a6/Anubias_barteri_var._nana.jpg/320px-Anubias_barteri_var._nana.jpg`,
    'equipos': `${WM}/e/e9/Planted_aquarium.jpg/320px-Planted_aquarium.jpg`,
    'alimentos': `${WM}/5/55/Betta_splendens.jpg/320px-Betta_splendens.jpg`,
    'acuarios-combos': `${WM}/e/e9/Planted_aquarium.jpg/320px-Planted_aquarium.jpg`,
  }

  for (const [slug, image] of Object.entries(categoryImages)) {
    await prisma.category.update({ where: { slug }, data: { image } }).catch(() => {})
  }

  console.log('\n✅ Imágenes actualizadas con Wikimedia Commons!')
}

main().finally(() => prisma.$disconnect())

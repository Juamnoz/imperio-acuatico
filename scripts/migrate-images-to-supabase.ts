/**
 * Migra imágenes locales de public/uploads/products/ a Supabase Storage
 * y actualiza las URLs en Neon DB + Supabase DB (LISA).
 *
 * Ejecutar: npx tsx scripts/migrate-images-to-supabase.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, extname } from 'path'
import { lookup } from 'mime-types'

// --- Config ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://devsupabase.automatesolutions.tech'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.QTPDqTHQLeahtLo7WP3Pvb42ol2cM8iPjt9u5NeXuaI'
const AGENT_ID = process.env.LISA_AGENT_ID || '28023bc2-66ce-4a3d-8bd6-dee3901dd15d'
const BUCKET = 'agent-images'
const STORAGE_PATH = `rooms/${AGENT_ID}/products`

const NEON_URL = process.env.DATABASE_URL || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'products')
const STATIC_DIR = join(process.cwd(), 'public', 'products')

async function uploadFile(dir: string, filename: string): Promise<string | null> {
  const filepath = join(dir, filename)
  const buffer = readFileSync(filepath)
  const contentType = lookup(filename) || 'image/jpeg'
  const storagePath = `${STORAGE_PATH}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true })

  if (error) {
    console.error(`  ✗ Error subiendo ${filename}: ${error.message}`)
    return null
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
  console.log(`  ✓ ${filename} → ${publicUrl}`)
  return publicUrl
}

async function main() {
  console.log('=== Migración de Imágenes a Supabase Storage ===\n')

  // 1. Subir imágenes de public/uploads/products/
  const urlMap: Record<string, string> = {}

  console.log('1. Subiendo imágenes de uploads/products/...')
  const uploadFiles = readdirSync(UPLOADS_DIR).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
  for (const file of uploadFiles) {
    const url = await uploadFile(UPLOADS_DIR, file)
    if (url) urlMap[`/uploads/products/${file}`] = url
  }

  // 2. Subir imágenes de public/products/ (las del seed)
  console.log('\n2. Subiendo imágenes de products/ (seed)...')
  const staticFiles = readdirSync(STATIC_DIR).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
  for (const file of staticFiles) {
    const url = await uploadFile(STATIC_DIR, file)
    if (url) urlMap[`/products/${file}`] = url
  }

  console.log(`\nTotal subidas: ${Object.keys(urlMap).length}`)

  // 3. Actualizar Neon DB (productos con paths relativos)
  if (!NEON_URL) {
    console.log('\n⚠ DATABASE_URL no configurado, saltando actualización de Neon DB')
  } else {
    console.log('\n3. Actualizando URLs en Neon DB...')
    // Importar prisma dinámicamente
    const { PrismaClient } = await import('../lib/generated/prisma/client.js')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: NEON_URL })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const products = await prisma.product.findMany()
    let updated = 0

    for (const product of products) {
      try {
        const imgs: string[] = JSON.parse(product.images || '[]')
        let changed = false
        const newImgs = imgs.map(img => {
          if (urlMap[img]) {
            changed = true
            return urlMap[img]
          }
          return img
        })

        if (changed) {
          await prisma.product.update({
            where: { id: product.id },
            data: { images: JSON.stringify(newImgs) },
          })
          console.log(`  ✓ ${product.name}: ${imgs[0]} → ${newImgs[0]}`)
          updated++
        }
      } catch (e) {
        console.error(`  ✗ Error con ${product.name}:`, e)
      }
    }
    console.log(`  Productos actualizados en Neon: ${updated}`)
    await prisma.$disconnect()
  }

  // 4. Actualizar Supabase DB (LISA) — usar REST API directo
  console.log('\n4. Actualizando URLs en Supabase DB (LISA)...')
  const { data: lisaProducts, error: lisaError } = await supabase
    .from('products')
    .select('id, name, image_url, external_id')
    .eq('agent_id', AGENT_ID)

  if (lisaError) {
    console.error('  ✗ Error leyendo productos LISA:', lisaError.message)
  } else if (lisaProducts) {
    let lisaUpdated = 0
    for (const lp of lisaProducts) {
      // Buscar por image_url con path relativo o por external_id match
      let newUrl: string | null = null

      if (lp.image_url) {
        // Si tiene URL que apunta a vercel.app/uploads/... o es path relativo
        const relPath = lp.image_url
          .replace(/^https?:\/\/[^/]+/, '') // quitar dominio
        if (urlMap[relPath]) {
          newUrl = urlMap[relPath]
        }
      }

      // Si no tenía imagen, buscar por external_id en Neon mapping
      if (!newUrl && lp.external_id) {
        // Intentar encontrar la imagen correcta del producto en Neon
        for (const [oldPath, url] of Object.entries(urlMap)) {
          // No podemos mapear sin más contexto, skip
          break
        }
      }

      if (newUrl) {
        const { error } = await supabase
          .from('products')
          .update({ image_url: newUrl })
          .eq('id', lp.id)

        if (!error) {
          console.log(`  ✓ LISA: ${lp.name}: → ${newUrl}`)
          lisaUpdated++
        } else {
          console.error(`  ✗ LISA error ${lp.name}:`, error.message)
        }
      }
    }
    console.log(`  Productos actualizados en LISA: ${lisaUpdated}`)
  }

  console.log('\n=== Migración completada ===')
}

main().catch(console.error)

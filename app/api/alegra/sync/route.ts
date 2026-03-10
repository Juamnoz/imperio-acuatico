import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAllItems, getAllCategories } from '@/lib/alegra'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Mapeo de categorías de Alegra → categorías limpias para la web
const CATEGORY_MAP: Record<string, string> = {
  'PECES': 'Peces',
  'PLANTAS NATURALES': 'Plantas Naturales',
  'Plantas Acuáticas': 'Plantas Naturales',
  'ALIMENTOS': 'Alimentos',
  'ALIMENTOS ': 'Alimentos',
  'Alimentos para peces': 'Alimentos',
  'ACONDICIONADORES': 'Acondicionadores',
  'FILTROS': 'Filtros y Equipos',
  'FILTRACION': 'Filtros y Equipos',
  'Equipos de suministro de aire': 'Filtros y Equipos',
  'ACUARIOS': 'Acuarios',
  'Acuarios y Accesorios': 'Acuarios',
  'Acuarios y Cubos': 'Acuarios',
  'Acuarios y Equipamiento': 'Acuarios',
  'DECORACIÓN': 'Decoración',
  'DECORACIÓN NATURAL': 'Decoración',
  'SUSTRATOS': 'Sustratos',
  'LAMPARAS': 'Lámparas',
  'TERMOSTATOS': 'Termostatos',
  'ACCESORIOS': 'Accesorios',
  'PARAMETROS': 'Parámetros',
  'HAMSTER': 'Mascotas',
  'JAULAS HAMSTER': 'Mascotas',
  'AVES': 'Mascotas',
  'Mobiliario y Accesorios para Mascotas': 'Mascotas',
  'Mobiliario y Componentes': 'Accesorios',
  'Gabinetes y Estructuras': 'Accesorios',
  'Adhesivos y Pegamentos': 'Accesorios',
  'SEPARADOS': 'Varios',
  'SERVICIO': 'Servicios',
  'TECHO': 'Accesorios',
  'Créditos y Finanzas': 'Varios',
}

export async function POST(req: NextRequest) {
  try {
    // Verificar clave de API para proteger el endpoint
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    if (key !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [alegraItems, alegraCategories] = await Promise.all([
      getAllItems(),
      getAllCategories(),
    ])

    // 1. Crear/actualizar categorías unificadas
    const categoryNames = new Set<string>()
    for (const item of alegraItems) {
      const alegraName = item.itemCategory?.name || 'SIN CATEGORÍA'
      const mappedName = CATEGORY_MAP[alegraName] || 'Varios'
      categoryNames.add(mappedName)
    }

    const categoryIdMap = new Map<string, string>() // mappedName → db id

    for (const name of categoryNames) {
      const slug = slugify(name)
      const existing = await db.category.findUnique({ where: { slug } })
      if (existing) {
        categoryIdMap.set(name, existing.id)
      } else {
        const created = await db.category.create({
          data: { name, slug },
        })
        categoryIdMap.set(name, created.id)
      }
    }

    // 2. Crear/actualizar productos
    let created = 0
    let updated = 0
    let skipped = 0

    for (const item of alegraItems) {
      if (item.status !== 'active') {
        skipped++
        continue
      }

      const price = item.price?.[0]?.price
      if (!price || price <= 0) {
        skipped++
        continue
      }

      const alegraName = item.itemCategory?.name || 'SIN CATEGORÍA'
      const mappedCategory = CATEGORY_MAP[alegraName] || 'Varios'
      const categoryId = categoryIdMap.get(mappedCategory)!

      const stock = item.inventory?.availableQuantity ?? 0
      const priceInt = Math.round(price)

      // Generar slug único
      let baseSlug = slugify(item.name)
      if (!baseSlug) baseSlug = `producto-${item.id}`

      const existing = await db.product.findUnique({
        where: { alegraId: item.id },
      })

      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: {
            name: item.name,
            price: priceInt,
            stock: Math.max(0, stock),
            available: stock > 0,
            categoryId,
            description: item.description,
          },
        })
        updated++
      } else {
        // Verificar slug duplicado
        let slug = baseSlug
        let slugSuffix = 2
        while (await db.product.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${slugSuffix}`
          slugSuffix++
        }

        await db.product.create({
          data: {
            alegraId: item.id,
            name: item.name,
            slug,
            description: item.description,
            price: priceInt,
            stock: Math.max(0, stock),
            available: stock > 0,
            categoryId,
          },
        })
        created++
      }
    }

    return NextResponse.json({
      success: true,
      totalAlegra: alegraItems.length,
      categories: categoryNames.size,
      created,
      updated,
      skipped,
    })
  } catch (error) {
    console.error('Alegra sync error:', error)
    return NextResponse.json(
      { error: 'Error en sincronización', details: String(error) },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Find products with duplicate names
    const allProducts = await db.product.findMany({
      select: { id: true, name: true, alegraId: true, images: true, createdAt: true },
      orderBy: { name: 'asc' },
    })

    const nameMap = new Map<string, typeof allProducts>()
    for (const p of allProducts) {
      const key = p.name.trim().toLowerCase()
      if (!nameMap.has(key)) nameMap.set(key, [])
      nameMap.get(key)!.push(p)
    }

    const duplicates: { name: string; count: number; ids: string[] }[] = []
    for (const [name, group] of nameMap) {
      if (group.length > 1) {
        duplicates.push({ name: group[0].name, count: group.length, ids: group.map((p) => p.id) })
      }
    }

    return NextResponse.json({
      totalProducts: allProducts.length,
      duplicateGroups: duplicates.length,
      duplicateProducts: duplicates.reduce((s, d) => s + d.count - 1, 0),
      duplicates,
    })
  } catch (error) {
    console.error('Dedupe check error:', error)
    return NextResponse.json({ error: 'Error checking duplicates' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const allProducts = await db.product.findMany({
      select: { id: true, name: true, alegraId: true, images: true, description: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const nameMap = new Map<string, typeof allProducts>()
    for (const p of allProducts) {
      const key = p.name.trim().toLowerCase()
      if (!nameMap.has(key)) nameMap.set(key, [])
      nameMap.get(key)!.push(p)
    }

    const toDelete: string[] = []
    for (const [, group] of nameMap) {
      if (group.length <= 1) continue

      // Keep the "best" one: prefer one with alegraId, then with images, then with description
      const sorted = [...group].sort((a, b) => {
        const scoreA = (a.alegraId ? 4 : 0) + (a.images !== '[]' ? 2 : 0) + (a.description ? 1 : 0)
        const scoreB = (b.alegraId ? 4 : 0) + (b.images !== '[]' ? 2 : 0) + (b.description ? 1 : 0)
        return scoreB - scoreA // higher score first
      })

      // Delete all except the best one
      for (let i = 1; i < sorted.length; i++) {
        toDelete.push(sorted[i].id)
      }
    }

    if (toDelete.length > 0) {
      await db.product.deleteMany({ where: { id: { in: toDelete } } })
    }

    return NextResponse.json({
      deleted: toDelete.length,
      remaining: allProducts.length - toDelete.length,
    })
  } catch (error) {
    console.error('Dedupe delete error:', error)
    return NextResponse.json({ error: 'Error removing duplicates' }, { status: 500 })
  }
}

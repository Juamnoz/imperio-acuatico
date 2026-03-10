import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public endpoint — returns only pixel IDs (no secrets)
export async function GET() {
  const rows = await db.siteSettings.findMany({
    where: { key: { in: ['ga4_id', 'meta_pixel_id', 'tiktok_pixel_id'] } },
  })

  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value

  return NextResponse.json(settings, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}

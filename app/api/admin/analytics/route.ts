import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const ANALYTICS_KEYS = [
  'ga4_id',           // G-XXXXXXXXXX
  'meta_pixel_id',    // 123456789012345
  'tiktok_pixel_id',  // CXXXXXXXXXXXXXXXXX
] as const

export async function GET() {
  const rows = await db.siteSettings.findMany({
    where: { key: { in: [...ANALYTICS_KEYS] } },
  })

  const settings: Record<string, string> = {}
  for (const k of ANALYTICS_KEYS) {
    settings[k] = rows.find((r) => r.key === k)?.value ?? ''
  }

  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const body = await req.json()

  const updates: Promise<unknown>[] = []
  for (const key of ANALYTICS_KEYS) {
    if (key in body) {
      updates.push(
        db.siteSettings.upsert({
          where: { key },
          update: { value: body[key] ?? '' },
          create: { key, value: body[key] ?? '' },
        })
      )
    }
  }

  await Promise.all(updates)
  return NextResponse.json({ ok: true })
}

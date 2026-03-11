import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function getSetting(key: string): Promise<string | null> {
  const row = await db.siteSettings.findUnique({ where: { key } })
  return row?.value ?? null
}

async function setSetting(key: string, value: string) {
  await db.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function GET() {
  try {
    const sandbox = await getSetting('mp_sandbox')
    return NextResponse.json({
      // Si no hay valor en DB, usar el env var como fallback
      mpSandbox: sandbox !== null ? sandbox === 'true' : process.env.NEXT_PUBLIC_MP_SANDBOX === 'true',
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Error reading settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.mpSandbox !== undefined) {
      await setSetting('mp_sandbox', body.mpSandbox ? 'true' : 'false')

      return NextResponse.json({
        mpSandbox: body.mpSandbox,
        message: body.mpSandbox
          ? 'Modo sandbox activado — los pagos son de prueba'
          : 'Modo producción activado — los pagos son reales',
      })
    }

    return NextResponse.json({ error: 'No settings to update' }, { status: 400 })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}

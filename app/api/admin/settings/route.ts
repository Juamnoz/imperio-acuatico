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
    const [
      sandbox, lisaSyncKey, lisaApiUrl, lisaAgentId,
      mpSbPublicKey, mpSbAccessToken, mpSbTestUser, mpSbTestPass,
      mpProdPublicKey, mpProdAccessToken, mpClientId,
    ] = await Promise.all([
      getSetting('mp_sandbox'),
      getSetting('lisa_sync_key'),
      getSetting('lisa_api_url'),
      getSetting('lisa_agent_id'),
      getSetting('mp_sb_public_key'),
      getSetting('mp_sb_access_token'),
      getSetting('mp_sb_test_user'),
      getSetting('mp_sb_test_pass'),
      getSetting('mp_prod_public_key'),
      getSetting('mp_prod_access_token'),
      getSetting('mp_client_id'),
    ])
    return NextResponse.json({
      mpSandbox: sandbox !== null ? sandbox === 'true' : process.env.NEXT_PUBLIC_MP_SANDBOX === 'true',
      mpSbPublicKey: mpSbPublicKey ?? '',
      mpSbAccessToken: mpSbAccessToken ?? '',
      mpSbTestUser: mpSbTestUser ?? '',
      mpSbTestPass: mpSbTestPass ?? '',
      mpProdPublicKey: mpProdPublicKey ?? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? '',
      mpProdAccessToken: mpProdAccessToken ?? process.env.MP_ACCESS_TOKEN ?? '',
      mpClientId: mpClientId ?? process.env.MP_CLIENT_ID ?? '',
      lisaSyncKey: lisaSyncKey ?? '',
      lisaApiUrl: lisaApiUrl ?? process.env.LISA_API_URL ?? '',
      lisaAgentId: lisaAgentId ?? process.env.LISA_AGENT_ID ?? '',
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

    if (body.mpSbPublicKey !== undefined || body.mpSbAccessToken !== undefined ||
        body.mpProdPublicKey !== undefined || body.mpProdAccessToken !== undefined ||
        body.mpClientId !== undefined || body.mpSbTestUser !== undefined || body.mpSbTestPass !== undefined) {
      if (body.mpSbPublicKey !== undefined) await setSetting('mp_sb_public_key', body.mpSbPublicKey)
      if (body.mpSbAccessToken !== undefined) await setSetting('mp_sb_access_token', body.mpSbAccessToken)
      if (body.mpSbTestUser !== undefined) await setSetting('mp_sb_test_user', body.mpSbTestUser)
      if (body.mpSbTestPass !== undefined) await setSetting('mp_sb_test_pass', body.mpSbTestPass)
      if (body.mpProdPublicKey !== undefined) await setSetting('mp_prod_public_key', body.mpProdPublicKey)
      if (body.mpProdAccessToken !== undefined) await setSetting('mp_prod_access_token', body.mpProdAccessToken)
      if (body.mpClientId !== undefined) await setSetting('mp_client_id', body.mpClientId)
      return NextResponse.json({ ok: true, message: 'Credenciales de MercadoPago guardadas' })
    }

    if (body.lisaSyncKey !== undefined || body.lisaApiUrl !== undefined || body.lisaAgentId !== undefined) {
      if (body.lisaSyncKey !== undefined) await setSetting('lisa_sync_key', body.lisaSyncKey)
      if (body.lisaApiUrl !== undefined) await setSetting('lisa_api_url', body.lisaApiUrl)
      if (body.lisaAgentId !== undefined) await setSetting('lisa_agent_id', body.lisaAgentId)
      return NextResponse.json({ ok: true, message: 'Configuración de LISA guardada' })
    }

    return NextResponse.json({ error: 'No settings to update' }, { status: 400 })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}

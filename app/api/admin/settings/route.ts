import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')

async function readEnv(): Promise<Map<string, string>> {
  const content = await readFile(envPath, 'utf-8')
  const map = new Map<string, string>()
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    map.set(trimmed.slice(0, eqIndex), trimmed.slice(eqIndex + 1))
  }
  return map
}

async function writeEnv(map: Map<string, string>) {
  const content = await readFile(envPath, 'utf-8')
  let result = content
  for (const [key, value] of map) {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (regex.test(result)) {
      result = result.replace(regex, `${key}=${value}`)
    }
  }
  await writeFile(envPath, result, 'utf-8')
}

export async function GET() {
  try {
    const env = await readEnv()
    return NextResponse.json({
      mpSandbox: env.get('NEXT_PUBLIC_MP_SANDBOX') === 'true',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error reading settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.mpSandbox !== undefined) {
      const env = await readEnv()
      env.set('NEXT_PUBLIC_MP_SANDBOX', body.mpSandbox ? 'true' : 'false')
      await writeEnv(env)

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

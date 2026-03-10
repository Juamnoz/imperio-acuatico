import { NextRequest, NextResponse } from 'next/server'
import { createToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const validEmail = process.env.ADMIN_USER
    const validPass = process.env.ADMIN_PASS

    if (email !== validEmail || password !== validPass) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = await createToken()

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}

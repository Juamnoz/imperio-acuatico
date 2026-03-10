import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'imperio-admin-token'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Also protect /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 })
    }
  }

  // Check for admin page routes
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

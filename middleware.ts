import { NextResponse, type NextRequest } from 'next/server'
import { buildNextPath, sanitizeNextPath } from '@/lib/auth/redirects'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATH_PREFIXES = ['/login', '/auth']

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname)
  )
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  const { response, hasSession } = await updateSession(request)

  if (!hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set(
      'next',
      buildNextPath(pathname, request.nextUrl.search)
    )
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && pathname === '/login') {
    const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'))
    return NextResponse.redirect(new URL(nextPath, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

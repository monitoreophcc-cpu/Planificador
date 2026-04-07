import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = new Set(['/login', '/auth/callback'])

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|json|txt|xml|webmanifest)$/.test(pathname)
  )
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  const { response, hasSession } = await updateSession(request)
  const isPublicRoute = PUBLIC_ROUTES.has(pathname)

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|json|txt|xml|webmanifest)$).*)',
  ],
}

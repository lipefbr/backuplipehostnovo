import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware — checks auth on the SERVER side (no client fetch needed).
 * Reads the session cookie directly from the HTTP request.
 * This is reliable through Cloudflare proxy because it's server-side.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /painel/* routes — require session cookie
  if (pathname.startsWith('/painel')) {
    const sessionToken = request.cookies.get('next-auth.session-token')
    if (!sessionToken) {
      // No session cookie — redirect to login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    // Session cookie exists — let the request through
    // PainelShell will use useSession() just for UI (name, avatar),
    // but the auth check is already done here (server-side)
    return NextResponse.next()
  }

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('next-auth.session-token')
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel', '/painel/:path*', '/admin', '/admin/:path*'],
}

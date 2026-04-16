import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('ncars_auth')?.value;

  // Protect ONLY /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

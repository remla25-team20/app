import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const versionCookie = req.cookies.get('version');
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();
  
  // If either we don't have a versionCookie yet or we have an outdated version update the cookie
  if (!versionCookie || versionCookie.value !== process.env.NEXT_PUBLIC_APP_VERSION) {
    response.cookies.set('version', process.env.NEXT_PUBLIC_APP_VERSION || 'v2', {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60, // 1 hour
      sameSite: 'lax',
    });
  }

  if (pathname.startsWith('/model-service/')) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const path = pathname.replace('/model-service', '');
    const rewrittenUrl = `${apiBaseUrl}${path}${req.nextUrl.search}`;

    return NextResponse.rewrite(rewrittenUrl, {
      request: {
        headers: req.headers,
      },
    });
  }

  return response;
}

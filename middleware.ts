// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const versionCookie = req.cookies.get('version');
  const response = NextResponse.next();

  if (!versionCookie || versionCookie.value !== process.env.APP_VERSION) {
    response.cookies.set('version', process.env.APP_VERSION || '0.0.1-default', {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60, // 1 hour
        sameSite: 'lax',
      });
  }

  if (pathname.startsWith('/model-service/')) {
    const apiBaseUrl = process.env.API_BASE_URL;
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

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico).*)"],
  };

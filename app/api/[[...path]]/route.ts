import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const HEADER = 'X-Version'
const COOKIE = 'X-Version'
const MAX_AGE = 60 * 60 // 1 hour

// One implementation reused for every verb you export
async function handler(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const apiPrefix = '/api/'
  const upstreamPath = pathname.startsWith(apiPrefix) ? pathname.slice(apiPrefix.length) : ''
  const qs = request.url.split('?')[1] ?? ''
  const target = `http://${process.env.NEXT_PUBLIC_API_BASE_URL}/${upstreamPath}${qs && '?' + qs}`

  // ──── forward the request ────────────────────────────────────────────
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE)?.value
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      // copy incoming headers you care about …
      [HEADER]: cookie ?? '',
    },
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',                  // so you pipe redirects too
    duplex: 'half',                      // required when sending a body
  } as RequestInit & { duplex: 'half' })

  // ──── copy status/body/headers back to the browser ──────────────────
  const res = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  })

  // persist the header → cookie (first hit only)
  const version = upstream.headers.get(HEADER)
  if (version) {
    cookieStore.set({
      name: COOKIE,
      value: version,
      maxAge: MAX_AGE,
      sameSite: 'lax',
      path: '/',                       // every route
    })
  }
  return res
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const DELETE = handler

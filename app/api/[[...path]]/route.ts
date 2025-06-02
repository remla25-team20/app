import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const HEADER = 'x-version'
const COOKIE = 'x-version'
const MAX_AGE = 60 * 60 // 1 hour

// One implementation reused for every verb you export
async function handler(req: Request,
  { params }: { params: { path?: string[] } }) {

  const upstreamPath = (params.path ?? []).join('/')        // '' on /api
  const qs = req.url.split('?')[1] ?? ''
  const target = `/${upstreamPath}${qs && '?' + qs}`

  // ──── forward the request ────────────────────────────────────────────
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE)?.value
  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      // copy incoming headers you care about …
      [HEADER]: cookie ?? '',
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    redirect: 'manual',                  // so you pipe redirects too
  })

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

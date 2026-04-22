import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — no auth required
  const publicRoutes = [
    '/',
    '/apply',
    '/auth/signin',
    '/auth/callback',
  ]

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/creators/') ||
    pathname.startsWith('/go/') ||
    pathname.startsWith('/auth/')

  // No session — redirect to signin if trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  // Session exists — check role and route accordingly
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Role mismatch protection — redirect to correct dashboard
    if (pathname.startsWith('/dashboard/student') && role !== 'student') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'creator' ? '/dashboard/creator' : role === 'admin' ? '/admin' : '/auth/signin'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/dashboard/creator') && role !== 'creator') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'student' ? '/dashboard/student' : role === 'admin' ? '/admin' : '/auth/signin'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'student' ? '/dashboard/student' : role === 'creator' ? '/dashboard/creator' : '/auth/signin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

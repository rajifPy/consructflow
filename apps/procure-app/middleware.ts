// ============================================
// Shared Authentication Middleware
// apps/procure-app/middleware.ts
// ============================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect all routes except /login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Check user role for specific routes
  if (session) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Example: Only procurement officers can access certain routes
    if (
      req.nextUrl.pathname.startsWith('/purchase-orders/create') &&
      profile?.role !== 'procurement_officer' &&
      profile?.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
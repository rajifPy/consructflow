// apps/crew-app/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Create Supabase client with proper cookie handling
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - this is important!
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isLoginPage = req.nextUrl.pathname === '/login';

    // Allow public access to login page
    if (isLoginPage) {
      // If user is already logged in, redirect to dashboard
      if (session) {
        console.log('User already logged in, redirecting to dashboard');
        return NextResponse.redirect(new URL('/', req.url));
      }
      console.log('Login page access allowed - no session');
      return res;
    }

    // Protect all other routes - require authentication
    if (!session) {
      console.log('No session found, redirecting to login');
      const redirectUrl = new URL('/login', req.url);
      // Add the original URL as a redirect parameter
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    console.log('Session valid for:', session.user.email);
    return res;
    
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue
    // This prevents breaking the app if there's a temporary issue
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

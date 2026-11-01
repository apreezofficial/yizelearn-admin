import {NextResponse, type NextRequest} from 'next/server';
import {SESSION_COOKIE} from './lib/auth';

// Every admin page needs a session; without one, go to the login page and come back afterwards.
export function middleware(req: NextRequest) {
  const signedIn = req.cookies.has(SESSION_COOKIE);
  const onLogin = req.nextUrl.pathname === '/login';
  if (!signedIn && !onLogin) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (signedIn && onLogin) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = {matcher: ['/((?!_next|favicon.ico|logo.png).*)']};

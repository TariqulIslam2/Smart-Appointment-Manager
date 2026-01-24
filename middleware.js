import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Allow access to home page
        if (req.nextUrl.pathname === '/') {
            return NextResponse.next();
        }

        // Allow access to auth pages - handled by NextAuth
        if (req.nextUrl.pathname.startsWith('/auth/')) {
            return NextResponse.next();
        }

        // For API routes, add user ID to headers
        if (req.nextUrl.pathname.startsWith('/api/') && req.nextauth.token) {
            const requestHeaders = new Headers(req.headers);
            requestHeaders.set('x-user-id', req.nextauth.token.id);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Home page is always accessible
                if (req.nextUrl.pathname === '/') {
                    return true;
                }

                // Auth pages are accessible without token
                if (req.nextUrl.pathname.startsWith('/auth/')) {
                    return true;
                }

                // All other pages require authentication
                return !!token;
            },
        },
        pages: {
            signIn: '/auth/login',
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api/auth (NextAuth handles this)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
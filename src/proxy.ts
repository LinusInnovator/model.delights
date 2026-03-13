import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
    '/api/enterprise(.*)',
]);

const isArchitectRoute = createRouteMatcher([
    '/architect(.*)'
]);

const isPublicV1Route = createRouteMatcher([
    '/api/v1(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
    // 1. Existing Basic Auth for Admin Dashboard
    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        const USER = process.env.ADMIN_USER;
        const PASS = process.env.ADMIN_PASS;

        if (!USER || !PASS) {
            console.warn('ADMIN_USER or ADMIN_PASS is not set in the environment variables.');
            return new NextResponse('Authentication perfectly configured but Environment Variables are missing. Please add ADMIN_USER and ADMIN_PASS to your Vercel project.', {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
            });
        }

        const basicAuth = request.headers.get('authorization');

        if (basicAuth) {
            const authValue = basicAuth.split(' ')[1] || '';
            const [user, pwd] = atob(authValue).split(':');

            if (user === USER && pwd === PASS) {
                return NextResponse.next();
            }
        }

        return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    // 2. Clerk Auth for B2B/Enterprise routes
    if (isProtectedRoute(request)) {
        await auth.protect();
    }

    // 3. API Key Gateway for B2B API Routes
    if (isPublicV1Route(request)) {
        // The Architect catalog is a public informational endpoint required by the frontend UI
        if (request.nextUrl.pathname === '/api/v1/blueprint' && request.method === 'GET') {
            const authHeader = request.headers.get('authorization');
            // If they provided a token, we could validate it, but for UI rendering we just let it pass if missing
            if (!authHeader) {
                return NextResponse.next();
            }
        }

        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new NextResponse(JSON.stringify({ error: 'Missing or invalid Authorization header. Expected Bearer token.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Check for Internal God Key Bypass
        if (process.env.INTERNAL_GOD_KEY && token === process.env.INTERNAL_GOD_KEY) {
            // Authorized via internal bypass
            return NextResponse.next();
        }

        // // TODO: Implement DB check for paid Enterprise keys
        // const isValidPaidKey = await checkKeyInDatabase(token);
        // if (isValidPaidKey) return NextResponse.next();

        return new NextResponse(JSON.stringify({ error: 'Invalid API Key' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

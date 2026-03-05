import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Determine the basic auth credentials from environment variables.
    // In local development, you should place these in .env.local
    const USER = process.env.ADMIN_USER;
    const PASS = process.env.ADMIN_PASS;

    // If the developer hasn't set credentials yet, optionally pass through or warn.
    // For extreme security, we'll enforce the lock even if the vars are missing, 
    // effectively throwing a 401 until they configure their Vercel environment.
    if (!USER || !PASS) {
        console.warn('ADMIN_USER or ADMIN_PASS is not set in the environment variables.');
        return new NextResponse('Authentication perfectly configured but Environment Variables are missing. Please add ADMIN_USER and ADMIN_PASS to your Vercel project.', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
    }

    // Get the basic auth header
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
        // The header looks like: "Basic bGluZThePteG==..."
        const authValue = basicAuth.split(' ')[1] || '';
        // Decode base64 
        const [user, pwd] = atob(authValue).split(':');

        // Check if credentials match securely
        if (user === USER && pwd === PASS) {
            return NextResponse.next();
        }
    }

    // If unauthorized or no header provided, prompt the browser's native login modal
    return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

// See "Matching Paths" below to learn more
export const config = {
    // The matcher applies this middleware ONLY to the admin dashboard and its subsequent APIs.
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};

import { NextRequest, NextResponse } from "next/server";

//Name of the cookie in which user credentials are saved.
const AUTH_COOKIE_NAME = 'authToken';

//Urls for which no login is required
const publicPaths = ['/login'];

export async function proxy(request: NextRequest) {
    //Get the requested url
    const { pathname } = request.nextUrl;
    //If the requested url matches with the public paths, proceed.
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }
    //Get the user's credentials from request
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    
    //Url to login page
    const loginUrl = new URL('/login', request.url);
    
    //If user is not logged in, redirect to login url
    if (!authToken) {
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    //Api to verify user's credentials
    const verificationUrl = new URL('/api/login', request.url);
    
    //Verify user's credentials
    const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken.value}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authToken.value }),
    });

    //If user doesn't have a valid token, redirect them to login url
    if (!response.ok) {
        console.warn('Token verification failed with status:', response.status);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    //if all checks pass, show the required page to user.
    return NextResponse.next();   
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|login|register|forgot-password|reset-password).*)'],
}
import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    let backendURL = `${URLs.FTPServer}`;
    
    const { searchParams } = new URL(request.url);
    const backendURLExtension = searchParams.get('url');
    if (backendURLExtension) {
        backendURL += backendURLExtension;
    }

    const backendResponse = await fetch(backendURL, {
        headers: {
            'Authorization': `Token ${AUTH_COOKIE_NAME}`
        },
    });

    if (!backendResponse.ok) return new Response('File not found', { status: 404 });

    return new NextResponse(backendResponse.body, {
        headers: {
            'Content-Type': backendResponse.headers.get('Content-Type') || 'application/pdf',
            'Content-Disposition': 'inline',
        },
    })
}
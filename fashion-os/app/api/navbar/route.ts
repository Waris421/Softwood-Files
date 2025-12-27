import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const NAVBAR_URL = `${URLs.AMServer}/api/navbar-options`;
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('pageName') || '';
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);

    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const backendResponse = await fetch(`${NAVBAR_URL}?pageName=${query}`,{
        headers: {
            'Authorization': `${authToken.value}`,
            'Content-Type': 'application/json',
        }
    });

    if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(
            { 
                error: 'Backend request failed', 
                details: errorData 
            }, 
            { status: backendResponse.status }
        );
    }

    const navBarItems = await backendResponse.json();

    return NextResponse.json(navBarItems);
}
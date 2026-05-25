import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_URL = `${URLs.AMServer}/api/inventories`;
//Name of the cookie in which user credentials are saved.
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('search') || '';

    const authToken = request.cookies.get(AUTH_COOKIE_NAME);

    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }
    
    const backendResponse = await fetch(`${SEARCH_URL}?search=${query}`,{
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

    const options = await backendResponse.json();

    return NextResponse.json(options);
}
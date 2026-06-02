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

    const { searchParams } = new URL(request.url);
    const po = searchParams.get('po');

    let backendURL = `${URLs.MMCServer}/mmc/inventory-receipt/add`;
    if (po) {
        backendURL += `?po=${po}`;
    }

    const backendResponse = await fetch(`${backendURL}`,{
        headers: {
            'Authorization': `Token ${authToken.value}`,
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

    const formData = await backendResponse.json();
    return NextResponse.json(formData);
}

export async function POST(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const body = await request.json();

    const backendURL = `${URLs.MMCServer}/mmc/inventory-receipt/add`;
    const backendResponse = await fetch(backendURL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
        
    const data = await backendResponse.json();
    const status = backendResponse.status;
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, {status: 200});
}
import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
    const {code} = await params;
    const URL = API_MAP.MERCHANDISING.STYLE.getStyleUpdate(code);

    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const backendResponse = await fetch(`${URL}`,{
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

    const data = await backendResponse.json();
    return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const {code} = await params;
    const URL = API_MAP.MERCHANDISING.STYLE.getStyleUpdate(code);

    const formData = await request.formData();

    const backendResponse = await fetch(URL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken.value}`,
        },
        body: formData,
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, {status: 200});
}
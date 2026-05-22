import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';
const URL = API_MAP.MMC.INVENTORY.getCodeGenerator();

export async function POST(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const requestBody = await request.json();

    const backendResponse = await fetch(URL, {
        method: 'POST',
        headers: {
        'Authorization': `Token ${authToken.value}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
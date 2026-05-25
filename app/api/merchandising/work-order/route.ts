import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = `${URLs.MerchServer}/merchandising/work-order`
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url)
    const backendResponse = await fetch(`${BACKEND_URL}?${searchParams.toString()}`, {
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

    const workOrders = await backendResponse.json();
    return NextResponse.json(workOrders);
}
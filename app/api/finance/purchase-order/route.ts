import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const PO_URL = `${URLs.FinanceServer}/finance/purchase-order`;
const AUTH_COOKIE_NAME = 'authToken';

// Authentication check
export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // Get the dates
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start') || `${new Date().getFullYear()}-01-01`;
    
    const backendResponse = await fetch(`${PO_URL}?start=${start}`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Accept': 'application/json',
        },
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
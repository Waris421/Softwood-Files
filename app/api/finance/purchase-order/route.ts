// Django server address
import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const PO_URL = `${URLs.HRServer}/finance/purchase-order`;
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
    // Call Django
    let backendResponse: Response;
    try {
        backendResponse = await fetch(`${PO_URL}?start=${start}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken.value}`,
                'Accept': 'application/json',
            },
        });
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }
    // Return the data
    const text = await backendResponse.text();
    try {
        const data = JSON.parse(text);
        return NextResponse.json(data, { status: backendResponse.status });
    } catch {
        return NextResponse.json({ message: 'Invalid response from Django', raw: text.slice(0, 500) }, { status: 502 });
    }
}



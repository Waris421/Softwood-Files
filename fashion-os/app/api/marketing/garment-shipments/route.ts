import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// fetches garment shipment records from Django
const SHIPMENTS_URL = `${URLs.HRServer}/marketing/garment-shipments`;
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {

    // block if not logged in
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let backendResponse: Response;
    try {
        backendResponse = await fetch(SHIPMENTS_URL, {
            method: 'GET',
            headers: {
                'Authorization': `${authToken.value}`,
                'Accept': 'application/json',
            },
        });
    } catch (error) {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    const text = await backendResponse.text();
    try {
        const data = JSON.parse(text);
        return NextResponse.json(data, { status: backendResponse.status });
    } catch {
        return NextResponse.json({ message: 'Invalid response from Django', raw: text.slice(0, 500) }, { status: 502 });
    }

}

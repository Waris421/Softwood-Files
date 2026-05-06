import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const SUMMARY_URL = `${URLs.HRServer}/marketing/shipments/summary`;
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let backendResponse: Response;
    try {
        backendResponse = await fetch(`${SUMMARY_URL}?month=${month}&year=${year}`, {
            method: 'GET',
            headers: {
                'Authorization': `${authToken.value}`,
                'Accept': 'application/json',
            },
        });
    } catch {
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

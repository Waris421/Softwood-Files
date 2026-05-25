import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// Step 1: the full Django URL for the readings endpoint
const READINGS_URL = `${URLs.HRServer}/energy/readings`;
// Step 2: name of the login cookie stored in the browser
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {
    // Step 3: read the login cookie — if missing, block the request immediately
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Step 4: extract the from/to date params the component passed in the URL
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Step 5: if either date is missing, reject the request before calling Django
    if (!from || !to) {
        return NextResponse.json({ message: 'Missing from or to parameters' }, { status: 400 });
    }

    // Step 6: call Django with the date range and auth token
    let backendResponse: Response;
    try {
        backendResponse = await fetch(`${READINGS_URL}?from=${from}&to=${to}`, {
            method: 'GET',
            headers: { 'Authorization': `${authToken.value}` },
        });
    } catch (error) {
        // Step 7: if Django is offline, return a clean error instead of crashing
        console.error('Could not reach readings server:', error);
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    // Step 8: read Django's response and send it back to the browser
    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}

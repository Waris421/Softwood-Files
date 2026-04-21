import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// full Django URL for the date-range endpoint
const DATE_RANGE_URL = `${URLs.HRServer}/energy/date-range`;
// name of the login cookie stored in the browser
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {
    // Step 2: read the login cookie — if missing, block the request immediately
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
        // Step 3: declare a variable to hold Django's reply
    let backendResponse: Response;
    try {
        // Step 4: call Django with a GET request, passing the login token in the header
        backendResponse = await fetch(DATE_RANGE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `${authToken.value}`,
            },
        });
    } catch (error) {
        // Step 5: if Django is offline, return a clean error instead of crashing
        console.error('Could not reach date-range server:', error);
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }
        // Step 6: read Django's response and send it back to the browser
    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}




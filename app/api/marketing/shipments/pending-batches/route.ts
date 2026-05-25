
import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// reads auth cookie, forwards to Django, returns the response
const PENDING_URL = `${URLs.HRServer}/marketing/shipments/pending-batches`;
const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let backendResponse: Response;
    try {
        backendResponse = await fetch(PENDING_URL, {
            headers: { 'Authorization': `${authToken.value}`, 'Accept': 'application/json' },
        });
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}

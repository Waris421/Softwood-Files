import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const CONFIRM_URL = `${URLs.HRServer}/marketing/shipments/confirm-upload`;
const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    let backendResponse: Response;
    try {
        backendResponse = await fetch(CONFIRM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `${authToken.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}

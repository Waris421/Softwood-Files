import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let backendResponse: Response;
    try {
        backendResponse = await fetch(`${URLs.HRServer}/finance/purchase-order/${id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken.value}`,
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

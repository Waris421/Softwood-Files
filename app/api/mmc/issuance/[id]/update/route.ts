import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const backendURL = `${URLs.MMCServer}/api/issuance/${id}/update`;

    const backendResponse = await fetch(backendURL, {
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        }
    });

    if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json({ error: 'Backend request failed', details: errorData }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const backendURL = `${URLs.MMCServer}/api/issuance/${id}/update`;
    const backendResponse = await fetch(backendURL, {
        method: 'PATCH',
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await backendResponse.json();
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
}

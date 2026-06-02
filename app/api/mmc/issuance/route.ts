import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const department = searchParams.get('department');
    const id = searchParams.get('id');

    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (department) query.set('department', department);
    if (id) query.set('id', id);

    const backendURL = `${URLs.MMCServer}/api/issuance${query.toString() ? `?${query.toString()}` : ''}`;

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

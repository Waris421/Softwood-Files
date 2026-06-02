import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const backendResponse = await fetch(`${URLs.HRServer}/options/departments`, {
            headers: {
                'Authorization': `Token ${authToken.value}`,
                'Content-Type': 'application/json',
            }
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({}));
            return NextResponse.json({ error: 'Backend request failed', details: errorData }, { status: backendResponse.status });
        }

        const departments = await backendResponse.json();
        const converted = departments
            .filter((d: any) => d.value !== "")
            .map((d: any) => ({ value: d.value, label: d.text }));
        return NextResponse.json(converted);
    } catch {
        return NextResponse.json({ error: 'Could not reach server' }, { status: 503 });
    }
}

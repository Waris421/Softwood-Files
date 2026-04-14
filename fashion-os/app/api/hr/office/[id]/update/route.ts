import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const URL = `${URLs.HRServer}/hr/office/${id}/update`;

    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const backendResponse = await fetch(`${URL}`,{
        headers: {
            'Authorization': `${authToken.value}`,
            'Content-Type': 'application/json',
        }
    });

    if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(
            { 
                error: 'Backend request failed', 
                details: errorData 
            }, 
            { status: backendResponse.status }
        );
    }

    const officeData = await backendResponse.json();
    return NextResponse.json(officeData);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const requestBody = await request.json();
    const URL = `${URLs.HRServer}/hr/office/${id}/update`;

    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const backendResponse = await fetch(URL, {
        method: 'POST',
        headers: {
        'Authorization': `${authToken.value}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, { status });
}
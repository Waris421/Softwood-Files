import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ uid: string, token: string }> }) {
    const { uid, token } = await params;
    const URL = API_MAP.AUTH.confirmResetPassword(uid, token);
    
    const backendResponse = await fetch(URL,{
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json([], { status: 200 });
    
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ uid: string, token: string }> }) {
    const requestBody = await request.json();
    const { uid, token } = await params;
    const URL = API_MAP.AUTH.confirmResetPassword(uid, token);

    const backendResponse = await fetch(URL, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json([], { status: 200 });
}
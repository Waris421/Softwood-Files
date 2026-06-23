import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ ids: string[] }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }
    const { ids } = await params;
    const backendURL = API_MAP.HR.ATTENDANCE.CORRECTION.getApproveRequest(ids);

    const backendResponse = await fetch(`${backendURL}`,{
        headers: {
            'Authorization': `Token ${authToken.value}`,
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

    const approvalData = await backendResponse.json();
    return NextResponse.json(approvalData);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ ids: string[] }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }   

    const { ids } = await params;
    const backendURL = API_MAP.HR.ATTENDANCE.CORRECTION.getApproveRequest(ids);
    const requestBody = await request.json();

    const backendResponse = await fetch(backendURL, {
        method: 'POST',
        headers: {
        'Authorization': `Token ${authToken.value}`,
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
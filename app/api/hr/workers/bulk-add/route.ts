import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function POST(request: NextRequest) {    
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const formData = await request.formData();
    const { searchParams } = new URL(request.url);

    const backendURL = API_MAP.HR.WORKER.getBulkAdd(searchParams);

    const backendResponse = await fetch(backendURL, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken.value}`,
        },
        body: formData,
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, {status: 200})
}
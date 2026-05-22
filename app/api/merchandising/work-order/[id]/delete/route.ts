import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const {id} = await params;
    const URL = API_MAP.MERCHANDISING.WORKORDER.getWorkOrderDelete(id);

    const backendResponse = await fetch(URL, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        }
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, { status });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }   

    const {id} = await params;
    const URL = API_MAP.MERCHANDISING.WORKORDER.getWorkOrderDelete(id);

    const backendResponse = await fetch(URL, {
        method: 'DELETE',
        headers: {
        'Authorization': `Token ${authToken.value}`,
        'Content-Type': 'application/json',
        },
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;

    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, { status });
}
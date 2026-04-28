import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const {code} = await params;
    const URL = `${URLs.MerchServer}/merchandising/style/${code}/copy`;
    const requestBody = await request.json();

    const backendResponse = await fetch(URL, {
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
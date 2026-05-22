import { SERVER_URLs } from "@/_components/constants/urls";
import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const URL = API_MAP.AUTH.getResetPassword();

export async function POST(request: NextRequest) {
    const requestBody = await request.json();

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
        return NextResponse.json(data, { status });
    }

    return NextResponse.json(data, { status });
}
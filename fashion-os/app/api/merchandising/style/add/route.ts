import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';
const ROUTES_URL = `${URLs.MerchServer}/options/preset-routes`

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const res = await fetch(ROUTES_URL, {
        headers: { 'Authorization': `Token ${authToken.value}` }
    })
    const data = await res.json().catch(() => [])
    const routes = data
        .filter((item: { value: number | null; text: string }) => item.value !== null)
        .map((item: { value: number; text: string }) => ({
            value: item.value,
            label: item.text,
        }))
    return NextResponse.json({ routes }, { status: res.status })
}

export async function POST(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const requestBody = await request.json();
    const backendResponse = await fetch(`${URLs.MerchServer}/merchandising/style/add`, {
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

    return NextResponse.json(data, {status: 200})
}
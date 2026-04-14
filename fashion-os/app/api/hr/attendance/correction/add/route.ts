import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);

    const backendURL = new URL(`${URLs.HRServer}/hr/attendance/correction/add`);

    const allowedKeys = ['date', 'type', 'employee'];
    allowedKeys.forEach(key => {
        const value = searchParams.get(key);
        if (value) {
            backendURL.searchParams.append(key, value);
        }
    });

    const backendResponse = await fetch(`${backendURL}`,{
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
                details: errorData.message || "An error occured."
            }, 
            { status: backendResponse.status }
        );
    }

    const formData = await backendResponse.json();
    return NextResponse.json(formData);
}
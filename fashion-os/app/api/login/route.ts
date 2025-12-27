import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_URL = `${URLs.AuthServer}/api/login`;

export async function POST(req: NextRequest) {
    const requestBody = await req.json();

    const backendResponse = await fetch(LOGIN_URL, {
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

    const token = data.token;
    const response = NextResponse.json(data, { status });

    response.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, //1 Year
        path: '/',
    });

    return response;
}
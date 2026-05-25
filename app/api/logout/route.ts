import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });


    response.cookies.set('authToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: -1,
        path: '/',
    });
    return response;
}
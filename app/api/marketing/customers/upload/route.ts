import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// the Django endpoint that will receive the customer file
const UPLOAD_URL = `${URLs.HRServer}/marketing/customers/upload`;
const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest) {

    // block the request if the user isn't logged in
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // grab the file from the incoming request
    const formData = await req.formData();

    // forward it straight to Django with the auth token attached
    let backendResponse: Response;
    try {
        backendResponse = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: { 'Authorization': `${authToken.value}` },
            body: formData,
        });
    } catch (error) {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}

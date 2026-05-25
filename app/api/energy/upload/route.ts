import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// the Django endpoint that receives the file
const UPLOAD_URL = `${URLs.HRServer}/energy/upload`;
const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest) {

    // get the auth token from the browser cookie
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // get the file from the incoming request
    const formData = await req.formData();

    // forward the file to Django with the auth token
    let backendResponse: Response;
    try {
        backendResponse = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `${authToken.value}`,
            },
            body: formData, // pass the file straight through to Django
        });
    } catch (error) {
        console.error('Could not reach upload server:', error);
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }

    // read Django's response and send it back to the browser
    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
}

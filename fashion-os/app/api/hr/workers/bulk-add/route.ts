import { URLs } from "@/_components/constants/urls";
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
    const dryRun = searchParams.get('dry_run');

    const backendURL = `${URLs.HRServer}/hr/worker/bulk-add?dry_run=${dryRun}`;

    const backendResponse = await fetch(backendURL, {
        method: 'POST',
        headers: {
            'Authorization': `${authToken.value}`,
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
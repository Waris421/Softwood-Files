import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const backendResponse = await fetch(`${URLs.FinanceServer}/finance/purchase-order/${id}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Accept': 'application/json',
        },
    });

    if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(
            { 
                error: 'Backend request failed', 
                details: errorData 
            }, 
            { status: backendResponse.status }
        );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
}
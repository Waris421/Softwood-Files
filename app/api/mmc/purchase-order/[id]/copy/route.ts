import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// Tells Django to copy this PO and returns the new PO number.

const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const res = await fetch(`${URLs.MMCServer}/mmc/purchase-order/${id}/copy`, {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Authorization': `Token ${authToken.value}` },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: 'Could not reach server' }, { status: 503 });
    }
}

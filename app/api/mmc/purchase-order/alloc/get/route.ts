import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

// This endpoint is used to fetch the default quantity for a given inventory item when adding it to a purchase order. 
// It expects a POST request with the inventory code in the body, and it returns the default quantity as provided by the backend MMC server.

const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const res = await fetch(`${URLs.MMCServer}/purchaseorder/alloc/get`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Authorization': `Token ${authToken.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ error: 'Could not reach server' }, { status: 503 });
    }
}

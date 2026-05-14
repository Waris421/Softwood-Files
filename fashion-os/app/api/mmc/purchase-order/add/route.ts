import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function POST(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const res = await fetch(`${URLs.MMCServer}/mmc/purchase-order/add`, {
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

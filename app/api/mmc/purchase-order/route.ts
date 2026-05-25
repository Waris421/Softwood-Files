import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const supplier  = searchParams.get('supplier')  || '';
    const poNumber  = searchParams.get('poNumber')  || '';
    const search    = searchParams.get('search')    || '';
    const page      = searchParams.get('page')      || '1';

    const query = new URLSearchParams();
    if (supplier) query.set('supplier', supplier);
    if (poNumber) query.set('poNumber', poNumber);
    if (search)   query.set('search',   search);
    if (page)     query.set('page',     page);

    try {
        const res = await fetch(`${URLs.MMCServer}/mmc/purchase-order?${query.toString()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Token ${authToken.value}`,
                'Accept': 'application/json',
            },
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 });
    }
}

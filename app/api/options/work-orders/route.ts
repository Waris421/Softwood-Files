import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const searches = searchParams.getAll('searches');
    const extraCols = searchParams.getAll('extraCols');

    const params = new URLSearchParams();
    params.set('search', search);
    extraCols.forEach(col => {
        params.append('extraCols', col);
    });
    searches.forEach(search => {
        params.append('searches', search);
    })

    const backendURL = `${URLs.MerchServer}/options/work-orders?${params.toString()}`;
    const backendResponse = await fetch(`${backendURL}`,{
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        }
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

    const workers = await backendResponse.json();
    return NextResponse.json(workers);
}
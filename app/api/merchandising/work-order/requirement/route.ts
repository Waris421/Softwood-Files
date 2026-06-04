import { API_MAP } from "@/_components/urls/api-map";
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
    const workOrder = searchParams.get('workOrder');
    const reqId = searchParams.get('id')

    let backendURL = API_MAP.MERCHANDISING.WORKORDER.getRequirementHistory(searchParams);;
    if (workOrder) {
        backendURL += `?orderNumber=${workOrder}`;
    }
    if (reqId) {
        backendURL += `&id=${reqId}`
    }

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

    const history = await backendResponse.json();
    return NextResponse.json(history);

}
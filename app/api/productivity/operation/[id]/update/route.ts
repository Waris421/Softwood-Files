import { API_MAP } from "@/_components/urls/api-map";
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = 'authToken';

const convertData = (data: any) => {
    return {
        OperationName: data.Name,
        Section: data.Section,
        Category: data.Category,
        Level: data.SkillLevel,
        SAM: data.SMV,
        Rate: data.Rate,
        OperationCode: data.Code,
        MachineType: data.MachineType
    };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const { id } = await params;
    const backendURL = API_MAP.PRODUCTIVITY.OPERATION.getOperationUpdate(id);

    const backendResponse = await fetch(backendURL, {
        headers: {
            'Authorization': `Token ${authToken.value}`,
            'Content-Type': 'application/json',
        }
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(convertData(data), {status: 200})
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
    const authToken = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    const { id } = await params;
    const backendURL = API_MAP.PRODUCTIVITY.OPERATION.getOperationUpdate(id);

    const requestBody = await request.json();

    const backendResponse = await fetch(backendURL, {
        method: 'POST',
        headers: {
        'Authorization': `Token ${authToken.value}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const data = await backendResponse.json();
    const status = backendResponse.status;
    if (!backendResponse.ok) {
        return NextResponse.json(data, { status: status });
    }

    return NextResponse.json(data, {status: 200})
}
import { URLs } from "@/_components/constants/urls";
import { NextRequest, NextResponse } from "next/server";

const SEARCH_URL = `${URLs.AMServer}/options/inventories`;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('search') || '';

    const backendResponse = await fetch(`${SEARCH_URL}?search=${query}`);

    const options = await backendResponse.json();

    return NextResponse.json(options);
}
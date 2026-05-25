import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

// Returns { data: [...], numberOfPages } — 10 rows per page
// Accepts: page (integer), plus all shared filter params (months[], countries[], etc.)
export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    try {
        const res = await fetch(`${URLs.HRServer}/marketing/export-data/details?${searchParams.toString()}`, {
            headers: { 'Authorization': authToken.value, 'Accept': 'application/json' },
        })
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 })
    }
}

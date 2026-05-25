import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

// Returns { quantity, price } totals for the current filter selection
export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    // Forward all filter query params (months[], countries[], etc.) straight to Django
    const { searchParams } = new URL(req.url)
    try {
        const res = await fetch(`${URLs.HRServer}/marketing/export-data/stats?${searchParams.toString()}`, {
            headers: { 'Authorization': authToken.value, 'Accept': 'application/json' },
        })
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 })
    }
}

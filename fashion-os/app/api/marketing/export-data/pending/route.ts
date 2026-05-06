import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    try {
        const res = await fetch(`${URLs.HRServer}/marketing/export-data/pending`, {
            headers: { 'Authorization': authToken.value, 'Accept': 'application/json' },
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 })
    }
}

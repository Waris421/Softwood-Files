import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

export async function POST(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    try {
        const res = await fetch(`${URLs.HRServer}/marketing/export-data/confirm`, {
            method: 'POST',
            headers: {
                'Authorization': authToken.value,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 })
    }
}

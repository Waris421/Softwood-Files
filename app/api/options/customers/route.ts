import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''

    try {
        const res = await fetch(
            `${URLs.MerchServer}/options/customers?search=${encodeURIComponent(search)}`,
            { headers: { 'Authorization': `Token ${authToken.value}` } }
        )
        const data = await res.json().catch(() => [])
        const converted = data.map((item: { value: string; text: string }) => ({
            value: item.value,
            label: item.text,
        }))
        return NextResponse.json(converted, { status: res.status })
    } catch {
        return NextResponse.json({ error: 'Could not reach server' }, { status: 503 })
    }
}

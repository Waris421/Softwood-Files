import { URLs } from "@/_components/constants/urls"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const backendUrl = `${URLs.MMCServer}/mmc/inventory`

    try {
        const res = await fetch(backendUrl, {
            cache: 'no-store',
            headers: { 'Authorization': `Token ${authToken.value}` }
        })
        const rawData = await res.json().catch(() => [])

        const items = Array.isArray(rawData) ? rawData : (rawData.results ?? [])
        const converted = items
            .filter((item: { Code: string; InUse: boolean }) => item.Code && item.InUse)
            .map((item: { Code: string; Name: string; Unit: string; Group: string }) => ({
                value: item.Code,
                label: `${item.Name} - ${item.Code}`,
                Unit: item.Unit,
                Group: item.Group,
            }))

        return NextResponse.json(converted)
    } catch {
        return NextResponse.json({ error: 'Could not reach server' }, { status: 503 })
    }
}

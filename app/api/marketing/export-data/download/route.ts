import { API_MAP } from "@/_components/urls/api-map"
import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = 'authToken'

// Streams the CSV file from Django — preserves Content-Disposition so the browser triggers a download
export async function GET(req: NextRequest) {
    const authToken = req.cookies.get(AUTH_COOKIE_NAME)
    if (!authToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    try {
        const res = await fetch(API_MAP.MARKETING.EXPORT_DATA.getDownload(searchParams), {
            headers: { 'Authorization': authToken.value },
        })
        if (!res.ok) return NextResponse.json({ message: 'Download failed.' }, { status: res.status })

        // Stream the file body and forward Content-Disposition so the browser saves it as a file
        const contentDisposition = res.headers.get('Content-Disposition') ?? 'attachment; filename="data.csv"'
        return new NextResponse(res.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': contentDisposition,
            },
        })
    } catch {
        return NextResponse.json({ message: 'Could not reach the server.' }, { status: 503 })
    }
}

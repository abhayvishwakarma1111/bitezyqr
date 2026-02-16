import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const session = cookieStore.get('superadmin_session')

    if (session?.value === 'valid') {
        return NextResponse.json({ authorized: true })
    }

    return NextResponse.json({ authorized: false }, { status: 401 })
}
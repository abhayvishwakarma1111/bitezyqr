import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { password } = await req.json()

    if (password !== process.env.SUPERADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('superadmin_session', 'valid', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
    })

    return response
}

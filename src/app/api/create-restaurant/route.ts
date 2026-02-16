import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const session = cookieStore.get('superadmin_session')

    if (session?.value !== 'valid') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { error } = await supabaseAdmin
        .from('restaurants')
        .insert([body])

    if (error) {
        return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
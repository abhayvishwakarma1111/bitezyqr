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

    const restaurantData = {
        ...body,
        tax_enabled: body.tax_enabled || false,
        tax_type: body.tax_enabled ? body.tax_type : null,
        tax_percentage: body.tax_enabled ? body.tax_percentage : 0,
        packaging_enabled: body.packaging_enabled || false,
        packaging_charge: body.packaging_enabled ? body.packaging_charge : 0
    }

    const { error } = await supabaseAdmin
        .from('restaurants')
        .insert([restaurantData])

    if (error) {
        return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
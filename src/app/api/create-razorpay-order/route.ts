import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const {
      restaurant_id,
      cart,
      customer_id,
      packaging_required,
      chef_note
    } = await req.json()

    if (!restaurant_id || !cart || Object.keys(cart).length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 1️⃣ Fetch restaurant Razorpay keys
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('razorpay_key_id, razorpay_key_secret')
      .eq('id', restaurant_id)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // 2️⃣ Fetch real menu prices from DB
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, price')
      .in('id', Object.keys(cart))
      .eq('restaurant_id', restaurant_id)

    if (menuError || !menuItems) {
      return NextResponse.json({ error: 'Menu fetch failed' }, { status: 500 })
    }

    // 3️⃣ Calculate total securely on server
    let calculatedTotal = 0

    for (const item of menuItems) {
      const quantity = cart[item.id]
      calculatedTotal += item.price * quantity
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    // 4️⃣ Generate token number
    const { data: tokenData, error: tokenError } = await supabase
      .rpc("get_next_token", {
        p_restaurant_id: restaurant_id,
      })

    if (tokenError) {
      return NextResponse.json({ error: "Token generation failed" }, { status: 500 })
    }

    const tokenNumber = tokenData

    // 5️⃣ Create order in DB with payment_status = CREATED
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          restaurant_id,
          customer_id,
          token_number: tokenNumber,
          packaging_required,
          chef_note,
          total_amount: calculatedTotal,
          cart,
          amount: calculatedTotal,
          payment_status: 'CREATED',
          status: null
        }
      ])
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    // 6️⃣ Create Razorpay order
    const razorpay = new Razorpay({
      key_id: restaurant.razorpay_key_id,
      key_secret: restaurant.razorpay_key_secret
    })

    const razorpayOrder = await razorpay.orders.create({
      amount: calculatedTotal * 100,
      currency: 'INR',
      receipt: order.id
    })

    // 7️⃣ Save razorpay_order_id in DB
    await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id
      })
      .eq('id', order.id)

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: restaurant.razorpay_key_id
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
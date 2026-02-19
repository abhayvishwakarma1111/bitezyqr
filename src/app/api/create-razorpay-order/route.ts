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
      .select(`
  razorpay_key_id,
  razorpay_key_secret,
  tax_enabled,
  tax_type,
  tax_percentage,
  packaging_enabled,
  packaging_charge
`)
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
    // 3️⃣ Calculate food subtotal
    let subtotal = 0

    for (const item of menuItems) {
      const quantity = cart[item.id]
      subtotal += item.price * quantity
    }

    if (subtotal <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    // 4️⃣ Apply tax (on food only)
    let taxAmount = 0
    let totalAfterTax = subtotal

    if (restaurant.tax_enabled && restaurant.tax_percentage > 0) {
      const percentage = restaurant.tax_percentage

      if (restaurant.tax_type === 'exclusive') {
        taxAmount = subtotal * (percentage / 100)
        totalAfterTax = subtotal + taxAmount
      }

      if (restaurant.tax_type === 'inclusive') {
        const basePrice = subtotal / (1 + percentage / 100)
        taxAmount = subtotal - basePrice
        totalAfterTax = subtotal
      }
    }

    // 5️⃣ Apply packaging (after tax)
    let packagingCharge = 0

    if (
      restaurant.packaging_enabled &&
      packaging_required
    ) {
      packagingCharge = restaurant.packaging_charge || 0
    }

    const finalTotal = totalAfterTax + packagingCharge

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
          subtotal,
          tax_amount: taxAmount,
          tax_percentage: restaurant.tax_percentage || 0,
          tax_type: restaurant.tax_type || null,
          packaging_charge: packagingCharge,
          total_amount: finalTotal,
          cart,
          amount: finalTotal,

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
      amount: Math.round(finalTotal * 100),
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
      razorpayKeyId: restaurant.razorpay_key_id,
      subtotal,
      taxAmount,
      packagingCharge,
      finalTotal,
      taxType: restaurant.tax_type,
      taxPercentage: restaurant.tax_percentage
    })


  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
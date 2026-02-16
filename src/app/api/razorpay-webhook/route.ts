import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return new NextResponse("No signature", { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const event = JSON.parse(body);

        // We only care about payment.captured
        if (event.event !== "payment.captured") {
            return NextResponse.json({ received: true });
        }

        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const amountPaid = payment.amount / 100; // convert paise to rupees

        // 1️⃣ Find order in DB
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("razorpay_order_id", razorpayOrderId)
            .single();

        if (orderError || !order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // 2️⃣ Prevent duplicate processing
        if (order.payment_status === "PAID") {
            return NextResponse.json({ message: "Already processed" });
        }

        // 3️⃣ Verify amount matches
        if (order.amount !== amountPaid) {
            return new NextResponse("Amount mismatch", { status: 400 });
        }

        // 4️⃣ Update order as PAID
        await supabase
            .from("orders")
            .update({
                payment_status: "PAID",
                razorpay_payment_id: razorpayPaymentId,
                status: "CREATED" // now kitchen can see it
            })
            .eq("id", order.id);

        // 5️⃣ Insert order items
        const cart = order.cart || {}; // We will fix this next

        if (cart && Object.keys(cart).length > 0) {
            const { data: menuItems } = await supabase
                .from("menu_items")
                .select("id, price")
                .in("id", Object.keys(cart));

            const orderItems = Object.keys(cart).map((itemId) => {
                const menuItem = menuItems?.find((m) => m.id === itemId);

                return {
                    order_id: order.id,
                    menu_item_id: itemId,
                    quantity: cart[itemId],
                    price: menuItem?.price || 0,
                };
            });

            await supabase.from("order_items").insert(orderItems);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return new NextResponse("Webhook error", { status: 500 });
    }
}
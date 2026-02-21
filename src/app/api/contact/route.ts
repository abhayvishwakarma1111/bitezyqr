import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { restaurant_name, owner_name, phone } = body;

        if (!restaurant_name || !owner_name || !phone) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("leads")
            .insert([
                {
                    restaurant_name,
                    owner_name,
                    phone,
                },
            ]);

        if (error) {
            console.error(error);
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

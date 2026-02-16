import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

async function handleLoveSpamToggle(action: string | null) {
    if (action !== "start" && action !== "stop" && action !== "status") {
        return NextResponse.json({ error: "Invalid action. Use 'start', 'stop', or 'status'." }, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === "status") {
        const { data } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "love_spam_start_time")
            .maybeSingle(); // Use maybeSingle to avoid 406 error if 0 rows

        const active = !!data;
        return NextResponse.json({ active, startTime: data?.value });
    }

    if (action === "start") {
        // Set start time to now
        const now = new Date().toISOString();
        const { error } = await supabase
            .from("settings")
            .upsert({ key: "love_spam_start_time", value: now }, { onConflict: "key" });

        if (error) {
            console.error("Error starting love spam:", error);
            // If table doesn't exist or other error
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Love spam started", startTime: now, active: true });
    } else {
        // Stop (delete the setting)
        const { error } = await supabase
            .from("settings")
            .delete()
            .eq("key", "love_spam_start_time");

        if (error) {
            console.error("Error stopping love spam:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Love spam stopped", active: false });
    }
}

export async function POST(request: Request) {
    try {
        const { action } = await request.json();
        return handleLoveSpamToggle(action);
    } catch (error) {
        console.error("Unexpected error in love spam toggle (POST):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        return handleLoveSpamToggle(action);
    } catch (error) {
        console.error("Unexpected error in love spam toggle (GET):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

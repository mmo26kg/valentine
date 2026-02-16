import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

async function handleLoveSpamToggle(action: string | null) {
    if (action !== "start" && action !== "stop") {
        return NextResponse.json({ error: "Invalid action. Use 'start' or 'stop'." }, { status: 400 });
    }

    const supabase = createClient();

    if (action === "start") {
        // Set start time to now
        const now = new Date().toISOString();
        const { error } = await supabase
            .schema("valentine")
            .from("settings")
            .upsert({ key: "love_spam_start_time", value: now }, { onConflict: "key" });

        if (error) {
            console.error("Error starting love spam:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Love spam started", startTime: now });
    } else {
        // Stop (delete the setting)
        const { error } = await supabase
            .schema("valentine")
            .from("settings")
            .delete()
            .eq("key", "love_spam_start_time");

        if (error) {
            console.error("Error stopping love spam:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Love spam stopped" });
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

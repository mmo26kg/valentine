import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET(request: Request) {
    try {
        const supabase = createClient();

        // 1. Check if spam mode is active
        const { data: setting, error: settingError } = await supabase
            .schema("valentine")
            .from("settings")
            .select("value")
            .eq("key", "love_spam_start_time")
            .single();

        if (settingError || !setting) {
            // Not active or error fetching setting (assume inactive)
            return NextResponse.json({ status: "inactive", message: "Love spam is not currently active." });
        }

        const startTime = new Date(setting.value);
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const ONE_HOUR_MS = 60 * 60 * 1000;

        // 2. Check if expired (run for 1 hour)
        if (diffMs > ONE_HOUR_MS) {
            // Stop it automatically
            await supabase
                .schema("valentine")
                .from("settings")
                .delete()
                .eq("key", "love_spam_start_time");

            return NextResponse.json({ status: "expired", message: "Love spam session expired and has been stopped." });
        }

        // 3. Send Love Log (Sender: "him")
        const { error: insertError } = await supabase
            .schema("valentine")
            .from("love_logs")
            .insert({ sender_id: "him" });

        if (insertError) {
            console.error("Error inserting love log:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({
            status: "sent",
            sender: "him",
            message: "Love log sent successfully.",
            timeRemainingMs: ONE_HOUR_MS - diffMs
        });

    } catch (error) {
        console.error("Unexpected error in love spam worker:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

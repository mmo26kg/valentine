"use client";

import { AnimatePresence } from "framer-motion";
import { SecretLockScreen } from "@/components/auth/secret-lock";
import { LoveCaptcha } from "@/components/auth/love-captcha";
import { EventScreen } from "@/components/auth/event-screen";
import { MainApp } from "@/components/main-app";
import { ValentineProvider, useValentine } from "@/providers/valentine-provider";
import { format } from "date-fns";
import { SPECIAL_EVENTS } from "@/lib/constants";

export default function ValentineApp() {
    return (
        <ValentineProvider>
            <ValentineAppContent />
        </ValentineProvider>
    );
}

function ValentineAppContent() {
    const {
        role,
        setRole,
        unlocked,
        captchaPassed,
        eventDismissed,
        unlock,
        passCaptcha,
        dismissEvent,
        lock,
        myProfile,
    } = useValentine();
    const partnerRole = (role === "ảnh" ? "ẻm" : "ảnh") as "ảnh" | "ẻm";

    // Password logic: Use profile password, default to '19042025' if not set
    const correctPassword = myProfile?.password || "19042025";

    // Step 1: Locked
    if (!unlocked) {
        return (
            <AnimatePresence mode="wait">
                <SecretLockScreen
                    key="lock"
                    correctPassword={correctPassword}
                    onUnlock={unlock}
                    currentRole={role}
                    onSelectRole={setRole}
                />
            </AnimatePresence>
        );
    }

    // Step 2: Love Captcha
    if (!captchaPassed) {
        return (
            <AnimatePresence mode="wait">
                <LoveCaptcha key="captcha" onPass={passCaptcha} />
            </AnimatePresence>
        );
    }

    // Step 3: Special Event Check
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayEventStr = `${month}-${day}`;

    const isSpecialEvent = SPECIAL_EVENTS.some((e) => e.date === todayEventStr);

    if (isSpecialEvent && !eventDismissed) {
        return (
            <AnimatePresence mode="wait">
                <EventScreen key="event" onDismiss={dismissEvent} />
            </AnimatePresence>
        );
    }

    // Step 4: Main App
    return (
        <MainApp />
    );
}

"use client";

import { AnimatePresence } from "framer-motion";
import { SecretLockScreen } from "@/components/auth/secret-lock";
import { LoveCaptcha } from "@/components/auth/love-captcha";
import { EventScreen } from "@/components/auth/event-screen";
import { MainApp } from "@/components/main-app";
import {
    useCurrentUser,
    useUnlocked,
    usePassword,
    useStartDate,
    useDailyCaptions,
    useTimelinePosts,
} from "@/lib/store";
import { format } from "date-fns";
import { SPECIAL_EVENTS } from "@/lib/constants";

export default function ValentineApp() {
    const { role, setRole } = useCurrentUser();
    const { unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock } =
        useUnlocked();
    const { password, setPassword } = usePassword();
    const { startDate, setStartDate } = useStartDate();
    const { setCaption, getCaption, hasWrittenToday } = useDailyCaptions();
    const { posts, addPost } = useTimelinePosts();

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const partnerRole = role === "ảnh" ? "ẻm" : "ảnh";

    // Check for special event today
    const monthDay = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
        new Date().getDate()
    ).padStart(2, "0")}`;
    const hasSpecialEvent = SPECIAL_EVENTS.some((e) => e.date === monthDay);

    // Step 1: Lock Screen
    if (!unlocked) {
        return (
            <SecretLockScreen
                onUnlock={unlock}
                onSelectRole={setRole}
                currentRole={role}
                correctPassword={password}
            />
        );
    }

    // Step 2: Love Captcha
    if (!captchaPassed) {
        return <LoveCaptcha onPass={passCaptcha} />;
    }

    // Step 3: Special Event (if today is a special date)
    if (hasSpecialEvent && !eventDismissed) {
        return (
            <AnimatePresence>
                <EventScreen onDismiss={dismissEvent} />
            </AnimatePresence>
        );
    }

    // Step 4: Main App
    return (
        <MainApp
            currentRole={role}
            startDate={startDate}
            password={password}
            myCaption={getCaption(todayStr, role)}
            partnerCaption={getCaption(todayStr, partnerRole)}
            hasWrittenToday={hasWrittenToday(todayStr, role)}
            onSubmitCaption={(content) => setCaption(todayStr, role, content)}
            posts={posts}
            onAddPost={addPost}
            onUpdateStartDate={setStartDate}
            onChangePassword={setPassword}
            onLock={lock}
        />
    );
}

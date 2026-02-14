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
    const { captions, setCaption, getCaption, hasWrittenToday } = useDailyCaptions();
    const { posts, addPost, updatePost, deletePost, togglePostReaction } = useTimelinePosts();

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const partnerRole = role === "ảnh" ? "ẻm" : "ảnh";
    const myCaptionObj = getCaption(todayStr, role);
    const partnerCaptionObj = getCaption(todayStr, partnerRole);

    // Helper to extract content safely (handles old string format if any data migration partial, or new object format)
    // store.ts updated to return object or null. 
    // Types updated in store.ts: Record<string, Record<string, { content: string; media_url?: string | null }>>
    // getCaption returns { content: string; media_url?: string|null} | null
    const myCaptionContent = myCaptionObj?.content || "";
    const partnerCaptionContent = partnerCaptionObj?.content || "";

    // Step 1: Locked
    if (!unlocked) {
        return (
            <AnimatePresence mode="wait">
                <SecretLockScreen
                    key="lock"
                    correctPassword={password}
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
        <MainApp
            currentRole={role}
            startDate={startDate}
            password={password}
            myCaption={myCaptionContent}
            partnerCaption={partnerCaptionContent}
            hasWrittenToday={hasWrittenToday(todayStr, role)}
            captions={captions}
            onSubmitCaption={(content, mediaUrl) => setCaption(todayStr, role, content, mediaUrl)}
            posts={posts}
            onAddPost={addPost}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
            onUpdateStartDate={setStartDate}
            onChangePassword={setPassword}
            onLock={lock}
            onTogglePostReaction={togglePostReaction}
        />
    );
}

"use client";

import { AnimatePresence } from "framer-motion";
import { SecretLockScreen } from "@/components/auth/secret-lock";
import { LoveCaptcha } from "@/components/auth/love-captcha";
import { EventScreen } from "@/components/auth/event-screen";
import { MainApp } from "@/components/main-app";
import {
    useCurrentUser,
    useUnlocked,
    useStartDate,
    useDailyCaptions,
    useTimelinePosts,
    useProfiles,
} from "@/lib/store";
import { format } from "date-fns";
import { SPECIAL_EVENTS } from "@/lib/constants";

export default function ValentineApp() {
    const { role, setRole } = useCurrentUser();
    const { unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock } =
        useUnlocked();
    const { startDate, setStartDate } = useStartDate();
    const { captions, setCaption, getCaption, hasWrittenToday } = useDailyCaptions();
    const { profiles, updateProfile } = useProfiles();
    const { posts, addPost, updatePost, deletePost, togglePostReaction } = useTimelinePosts();

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const partnerRole = role === "ảnh" ? "ẻm" : "ảnh";
    const myCaptionObj = getCaption(todayStr, role);
    const partnerCaptionObj = getCaption(todayStr, partnerRole);

    const myCaptionContent = myCaptionObj?.content || "";
    const partnerCaptionContent = partnerCaptionObj?.content || "";

    // Map UI role to DB ID
    const dbId = role === "ảnh" ? "him" : "her";

    // Password logic: Use profile password, default to '19042025' if not set
    const myProfile = profiles[dbId];
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
        <MainApp
            currentRole={role}
            startDate={startDate}
            password={myProfile?.password || "19042025"} // Pass user password logic
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
            onChangePassword={(newPass) => {
                if (myProfile) {
                    updateProfile({ ...myProfile, password: newPass });
                }
            }}
            onLock={lock}
            onTogglePostReaction={togglePostReaction}
        />
    );
}

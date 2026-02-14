"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
    useCurrentUser,
    useUnlocked,
    useStartDate,
    useDailyCaptions,
    useTimelinePosts,
    useProfiles,
    useNotifications,
    useCountdowns,
    useGreetings,
    sendNotification
} from "@/lib/store";
import { TimelinePost, Profile, CountdownEvent, Greeting } from "@/lib/types";

interface ValentineAuthContextType {
    role: "ảnh" | "ẻm";
    setRole: (role: "ảnh" | "ẻm") => void;
    partnerRole: "ảnh" | "ẻm";
    unlocked: boolean;
    captchaPassed: boolean;
    eventDismissed: boolean;
    unlock: () => void;
    passCaptcha: () => void;
    dismissEvent: () => void;
    lock: () => void;
    profiles: Record<keyof any, Profile>;
    updateProfile: (updates: Profile) => Promise<boolean>;
    onChangePassword: (newPass: string) => void;
    myProfile: Profile | undefined;
    partnerProfile: Profile | undefined;
    partnerName: string;
    currentUserAvatarURL: string | null;
}

interface ValentineDataContextType {
    startDate: string;
    setStartDate: (date: string) => void;
    captions: any;
    myCaption: string;
    partnerCaption: string;
    hasWrittenToday: boolean;
    onSubmitCaption: (content: string, mediaUrl?: string | null) => void;
    posts: TimelinePost[];
    addPost: (post: Omit<TimelinePost, "id" | "created_at">) => void;
    updatePost: (id: string, updates: Partial<TimelinePost>) => void;
    deletePost: (id: string, mediaUrls: string[]) => void;
    togglePostReaction: (postId: string, userId: string, emoji: string) => void;
    countdowns: CountdownEvent[];
    addCountdown: (countdown: Omit<CountdownEvent, "id">) => void;
    updateCountdown: (id: string, updates: Partial<CountdownEvent>) => void;
    deleteCountdown: (id: string) => void;
    greetings: Greeting[];
    addGreeting: (content: string, timeOfDay: string, authorId: string) => void;
    deleteGreeting: (id: string) => void;
}

const AuthContext = createContext<ValentineAuthContextType | undefined>(undefined);
const DataContext = createContext<ValentineDataContextType | undefined>(undefined);

export function ValentineProvider({ children }: { children: React.ReactNode }) {
    // 1. Initialize all hooks
    const { role, setRole } = useCurrentUser();
    const { unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock } = useUnlocked();
    const { startDate, setStartDate } = useStartDate();
    const { captions, setCaption, getCaption, hasWrittenToday: checkHasWrittenToday } = useDailyCaptions();
    const { profiles, updateProfile } = useProfiles();
    const { posts, addPost, updatePost, deletePost, togglePostReaction } = useTimelinePosts();
    const { countdowns, addCountdown, updateCountdown, deleteCountdown } = useCountdowns();
    const { greetings, addGreeting, deleteGreeting } = useGreetings();

    // 2. Derive state
    const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
    const partnerRole = (role === "ảnh" ? "ẻm" : "ảnh") as "ảnh" | "ẻm";

    const dbId = role === "ảnh" ? "him" : "her";
    const partnerDbId = partnerRole === "ảnh" ? "him" : "her";

    const myProfile = profiles[dbId];
    const partnerProfile = profiles[partnerDbId];
    const partnerName = partnerProfile?.name || (partnerRole === "ảnh" ? "Anh" : "Em");
    const currentUserAvatarURL = myProfile?.avatar_url || null;

    const myCaptionObj = useMemo(() => getCaption(todayStr, role), [getCaption, todayStr, role]);
    const partnerCaptionObj = useMemo(() => getCaption(todayStr, partnerRole), [getCaption, todayStr, partnerRole]);

    const myCaption = myCaptionObj?.content || "";
    const partnerCaption = partnerCaptionObj?.content || "";
    const hasWrittenToday = checkHasWrittenToday(todayStr, role);

    const onSubmitCaption = (content: string, mediaUrl?: string | null) => {
        setCaption(todayStr, role, content, mediaUrl);
    };

    const onChangePassword = (newPass: string) => {
        if (myProfile) {
            updateProfile({ ...myProfile, password: newPass });
        }
    };

    // 3. Side Effects (Reminders) - Keep it here or move? Keep for now but only dep on countdowns
    useEffect(() => {
        const checkReminders = async () => {
            const now = new Date();
            for (const event of countdowns) {
                const target = new Date(event.date);
                const diffMs = target.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours <= 24 && diffHours > 23) {
                    const key = `reminder-1d-${event.id}-${target.getFullYear()}`;
                    await Promise.all([
                        sendNotification({
                            user_id: "him",
                            title: "Sắp đến ngày quan trọng! 📅",
                            body: `Chỉ còn 1 ngày nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-him`
                        }),
                        sendNotification({
                            user_id: "her",
                            title: "Sắp đến ngày quan trọng! 📅",
                            body: `Chỉ còn 1 ngày nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-her`
                        })
                    ]);
                }
            }
        };

        const interval = setInterval(checkReminders, 1000 * 60 * 60);
        checkReminders();
        return () => clearInterval(interval);
    }, [countdowns]);

    const authValue = useMemo(() => ({
        role,
        setRole,
        partnerRole,
        unlocked,
        captchaPassed,
        eventDismissed,
        unlock,
        passCaptcha,
        dismissEvent,
        lock,
        profiles,
        updateProfile,
        onChangePassword,
        myProfile,
        partnerProfile,
        partnerName,
        currentUserAvatarURL,
    }), [role, setRole, partnerRole, unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock, profiles, updateProfile, myProfile, partnerProfile, partnerName, currentUserAvatarURL]);

    const dataValue = useMemo(() => ({
        startDate,
        setStartDate,
        captions,
        myCaption,
        partnerCaption,
        hasWrittenToday,
        onSubmitCaption,
        posts,
        addPost,
        updatePost,
        deletePost,
        togglePostReaction,
        countdowns,
        addCountdown,
        updateCountdown,
        deleteCountdown,
        greetings,
        addGreeting,
        deleteGreeting,
    }), [startDate, setStartDate, captions, myCaption, partnerCaption, hasWrittenToday, posts, addPost, updatePost, deletePost, togglePostReaction, countdowns, addCountdown, updateCountdown, deleteCountdown, greetings, addGreeting, deleteGreeting]);

    return (
        <AuthContext.Provider value={authValue}>
            <DataContext.Provider value={dataValue}>
                {children}
            </DataContext.Provider>
        </AuthContext.Provider>
    );
}

export function useValentineAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useValentineAuth must be used within a ValentineProvider");
    }
    return context;
}

export function useValentineData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useValentineData must be used within a ValentineProvider");
    }
    return context;
}

/** Legacy hook - merges both, but using this will cause re-renders on ANY change */
export function useValentine() {
    const auth = useValentineAuth();
    const data = useValentineData();
    return { ...auth, ...data };
}

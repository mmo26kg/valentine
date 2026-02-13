"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Local Storage Helpers ───
function getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
}

function setItem<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
}

// ─── Custom Hooks ───

/** Auth state — which user is currently active */
export function useCurrentUser() {
    const [role, setRoleState] = useState<"ảnh" | "ẻm">("ẻm");

    useEffect(() => {
        const stored = getItem("valentine_current_role", "ẻm");
        // Prevent hydration mismatch / update during render
        setTimeout(() => setRoleState(stored), 0);
    }, []);

    const setRole = useCallback((r: "ảnh" | "ẻm") => {
        setRoleState(r);
        setItem("valentine_current_role", r);
    }, []);

    return { role, setRole };
}

/** Whether the app is unlocked */
export function useUnlocked() {
    const [unlocked, setUnlockedState] = useState(false);
    const [captchaPassed, setCaptchaPassedState] = useState(false);
    const [eventDismissed, setEventDismissedState] = useState(false);

    useEffect(() => {
        const u = getItem("valentine_unlocked", false);
        const c = getItem("valentine_captcha", false);
        const e = getItem("valentine_event_dismissed", false);
        setTimeout(() => {
            setUnlockedState(u);
            setCaptchaPassedState(c);
            setEventDismissedState(e);
        }, 0);
    }, []);

    const unlock = useCallback(() => {
        setUnlockedState(true);
        setItem("valentine_unlocked", true);
    }, []);

    const passCaptcha = useCallback(() => {
        setCaptchaPassedState(true);
        setItem("valentine_captcha", true);
    }, []);

    const dismissEvent = useCallback(() => {
        setEventDismissedState(true);
        setItem("valentine_event_dismissed", true);
    }, []);

    const lock = useCallback(() => {
        setUnlockedState(false);
        setCaptchaPassedState(false);
        setEventDismissedState(false);
        setItem("valentine_unlocked", false);
        setItem("valentine_captcha", false);
        setItem("valentine_event_dismissed", false);
    }, []);

    return { unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock };
}

/** App password (stored as plain text for demo, use bcrypt in prod) */
export function usePassword() {
    const [password, setPasswordState] = useState("19042025");

    useEffect(() => {
        const stored = getItem("valentine_password", "19042025");
        setTimeout(() => setPasswordState(stored), 0);
    }, []);

    const setPassword = useCallback((p: string) => {
        setPasswordState(p);
        setItem("valentine_password", p);
    }, []);

    return { password, setPassword };
}

/** Couple start date */
export function useStartDate() {
    const [startDate, setStartDateState] = useState("2025-04-19");

    useEffect(() => {
        const stored = getItem("valentine_start_date", "2025-04-19");
        setTimeout(() => setStartDateState(stored), 0);
    }, []);

    const setStartDate = useCallback((d: string) => {
        setStartDateState(d);
        setItem("valentine_start_date", d);
    }, []);

    return { startDate, setStartDate };
}

/** Daily captions stored locally */
export function useDailyCaptions() {
    const [captions, setCaptionsState] = useState<
        Record<string, Record<string, string>>
    >({});

    useEffect(() => {
        const stored = getItem("valentine_captions", {});
        setTimeout(() => setCaptionsState(stored), 0);
    }, []);

    const setCaption = useCallback(
        (date: string, role: string, content: string) => {
            setCaptionsState((prev) => {
                const updated = {
                    ...prev,
                    [date]: { ...prev[date], [role]: content },
                };
                setItem("valentine_captions", updated);
                return updated;
            });
        },
        []
    );

    const getCaption = useCallback(
        (date: string, role: string) => {
            return captions[date]?.[role] || "";
        },
        [captions]
    );

    const hasWrittenToday = useCallback(
        (date: string, role: string) => {
            return !!captions[date]?.[role];
        },
        [captions]
    );

    return { captions, setCaption, getCaption, hasWrittenToday };
}

/** Timeline posts stored locally */
export function useTimelinePosts() {
    const [posts, setPostsState] = useState<
        Array<{
            id: string;
            user_id: string;
            title: string;
            content: string;
            media_url: string | null;
            event_date: string;
            type: "photo" | "video" | "text" | "milestone";
            created_at: string;
            location?: string;
        }>
    >([]);

    useEffect(() => {
        const stored = getItem("valentine_posts", null);
        if (stored) {
            setPostsState(stored);
        } else {
            // Load sample data
            import("./constants").then((mod) => {
                setPostsState(mod.SAMPLE_TIMELINE_POSTS);
                setItem("valentine_posts", mod.SAMPLE_TIMELINE_POSTS);
            });
        }
    }, []);

    const addPost = useCallback(
        (
            post: Omit<(typeof posts)[0], "id" | "created_at">
        ) => {
            const newPost = {
                ...post,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
            };
            setPostsState((prev) => {
                const updated = [newPost, ...prev];
                setItem("valentine_posts", updated);
                return updated;
            });
        },
        []
    );

    return { posts, addPost };
}

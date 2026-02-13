"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── Local Storage Helpers (for session data) ───
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

/** Auth state — which user is currently active (Local Session) */
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

/** Whether the app is unlocked (Local Session) */
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

/** App password (Shared via Supabase) */
export function usePassword() {
    const [password, setPasswordState] = useState("19042025");

    useEffect(() => {
        // Fetch initially
        supabase
            .from("settings")
            .select("value")
            .eq("key", "password")
            .single()
            .then(({ data }) => {
                if (data) setPasswordState(data.value);
            });

        // Realtime subscription
        const channel = supabase
            .channel("settings_password")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "valentine",
                    table: "settings",
                    filter: "key=eq.password",
                },
                (payload) => {
                    if (payload.new && "value" in payload.new) {
                        setPasswordState(payload.new.value as string);
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const setPassword = useCallback(async (p: string) => {
        setPasswordState(p);
        await supabase.from("settings").upsert({ key: "password", value: p });
    }, []);

    return { password, setPassword };
}

/** Couple start date (Shared via Supabase) */
export function useStartDate() {
    const [startDate, setStartDateState] = useState("2025-04-19");

    useEffect(() => {
        // Fetch initially
        supabase
            .from("settings")
            .select("value")
            .eq("key", "start_date")
            .single()
            .then(({ data }) => {
                if (data) setStartDateState(data.value);
            });

        // Realtime subscription
        const channel = supabase
            .channel("settings_start_date")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "valentine",
                    table: "settings",
                    filter: "key=eq.start_date",
                },
                (payload) => {
                    if (payload.new && "value" in payload.new) {
                        setStartDateState(payload.new.value as string);
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const setStartDate = useCallback(async (d: string) => {
        setStartDateState(d);
        await supabase.from("settings").upsert({ key: "start_date", value: d });
    }, []);

    return { startDate, setStartDate };
}

/** Daily captions (Shared via Supabase) */
export function useDailyCaptions() {
    const [captions, setCaptionsState] = useState<
        Record<string, Record<string, { content: string; media_url?: string | null }>>
    >({});

    const fetchCaptions = async () => {
        const { data, error } = await supabase
            .from("captions")
            .select("*")
            .order("date", { ascending: false }); // Order by date descending for history

        if (error) {
            console.error("Error fetching captions:", error);
        }

        if (data) {
            console.log("Raw captions fetched:", data);
            const formatted: Record<string, Record<string, { content: string; media_url?: string | null }>> = {};
            data.forEach((item) => {
                // Normalize role: him -> ảnh, her -> ẻm
                let role = item.role;
                if (role === "him") role = "ảnh";
                if (role === "her") role = "ẻm";

                if (!formatted[item.date]) formatted[item.date] = {};
                formatted[item.date][role as string] = {
                    content: item.content,
                    media_url: item.media_url
                };
            });
            console.log("Formatted captions:", formatted);
            setCaptionsState(formatted);
        }
    };

    useEffect(() => {
        const loadCaptions = async () => {
            await fetchCaptions();
        };
        loadCaptions();

        const channel = supabase
            .channel("captions_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "valentine", table: "captions" },
                () => {
                    fetchCaptions();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const setCaption = useCallback(
        async (date: string, role: string, content: string, media_url?: string | null) => {
            // Optimistic update
            setCaptionsState((prev) => ({
                ...prev,
                [date]: {
                    ...prev[date],
                    [role]: { content, media_url }
                },
            }));

            await supabase
                .from("captions")
                .upsert({ date, role, content, media_url }, { onConflict: "date,role" });
        },
        []
    );

    const getCaption = useCallback(
        (date: string, role: string) => {
            return captions[date]?.[role] || null;
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

/** Timeline posts (Shared via Supabase) */
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

    const fetchPosts = async () => {
        const { data } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (data && data.length > 0) {
            setPostsState(data);
        } else {
            // Fallback/Seed if empty? logic can be added here, 
            // but for now we assume DB is source of truth.
            // If DB is empty, user starts fresh or we can seed manually once.
        }
    };

    useEffect(() => {
        const loadPosts = async () => {
            await fetchPosts();
        };
        loadPosts();

        const channel = supabase
            .channel("posts_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "valentine", table: "posts" },
                () => {
                    fetchPosts();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const addPost = useCallback(
        async (post: Omit<(typeof posts)[0], "id" | "created_at">) => {
            const newPost = {
                ...post,
                // id and created_at generated by DB mostly, but for optimistic UI:
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
            };

            // Optimistic update
            setPostsState((prev) => [newPost, ...prev]);

            // Database insert (let DB handle ID and created_at if desired, 
            // but we pass excluding id to let DB gen random uuid if we want,
            // or pass ID if we want to ensure consistency)
            const { error } = await supabase.from("posts").insert({
                user_id: post.user_id,
                title: post.title,
                content: post.content,
                media_url: post.media_url,
                event_date: post.event_date,
                type: post.type,
                location: post.location
            });

            if (error) {
                console.error("Error adding post:", error);
                // Revert optimistic update if needed, but keeping simple for now
                fetchPosts(); // Refetch to be safe
            }
        },
        []
    );

    return { posts, addPost };
}

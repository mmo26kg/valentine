import { useState, useEffect, useCallback } from "react";
import { TimelinePost, SpecialEvent, CountdownEvent, Profile, Comment, AppNotification } from "./types";
import { supabase } from "@/lib/supabase";
import { formatVietnamDate } from "@/lib/date-utils";

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

export async function sendNotification(payload: { user_id: string; title: string; body: string; type?: string; link?: string; notification_key?: string }) {
    try {
        const { error } = await supabase
            .from("notifications")
            .insert([{ ...payload, is_read: false }]);
        // Ignore unique constraint violation (duplicate notification_key)
        if (error && error.code !== "23505") {
            console.error("Error sending notification:", error);
        }
    } catch (err) {
        console.error("Unexpected error sending notification:", err);
    }
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
        console.log("useUnlocked: lock() called");
        setUnlockedState(false);
        setCaptchaPassedState(false);
        setEventDismissedState(false);
        setItem("valentine_unlocked", false);
        setItem("valentine_captcha", false);
        setItem("valentine_event_dismissed", false);
    }, []);

    return { unlocked, captchaPassed, eventDismissed, unlock, passCaptcha, dismissEvent, lock };
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

            // Send notification to the other person
            const senderName = role === "ảnh" ? "Anh" : "Em";
            const recipientId = role === "ảnh" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Có Caption mới! ✨",
                body: `${senderName} vừa cập nhật cảm nghĩ ngày hôm nay.`,
                type: "caption",
                link: "timeline" // or however your app routes
            });
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
    const [posts, setPostsState] = useState<TimelinePost[]>([]);

    const fetchPosts = async () => {
        const { data } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (data && data.length > 0) {
            const formatted = data.map(p => ({
                ...p,
                reactions: p.reactions || {}
            }));
            setPostsState(formatted);
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
            const tempId = crypto.randomUUID();
            const newPost = {
                ...post,
                id: tempId,
                created_at: formatVietnamDate(undefined, "yyyy-MM-dd'T'HH:mm:ssXXX"),
            };

            // Optimistic update
            setPostsState((prev) => [newPost, ...prev]);

            // Database insert - pass the generated ID!
            const { error } = await supabase.from("posts").insert({
                id: tempId, // Important: Use the same ID!
                user_id: post.user_id,
                title: post.title,
                content: post.content,
                media_url: post.media_url,
                media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
                event_date: post.event_date,
                type: post.type,
                location: post.location
            });

            if (error) {
                console.error("Error adding post:", error);
                // Revert optimistic update
                setPostsState((prev) => prev.filter(p => p.id !== tempId));
            } else {
                // Send notification
                const senderName = post.user_id === "him" ? "Anh" : "Em";
                const recipientId = post.user_id === "him" ? "her" : "him";
                sendNotification({
                    user_id: recipientId,
                    title: "Kỷ niệm mới! 📸",
                    body: `${senderName} vừa thêm một bài viết mới vào dòng thời gian.`,
                    type: "timeline",
                    link: "timeline"
                });
            }
        },
        []
    );

    const updatePost = useCallback(
        async (id: string, updates: Partial<Omit<(typeof posts)[0], "id" | "created_at">>) => {
            // Optimistic update
            setPostsState((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
            );

            const { error } = await supabase
                .from("posts")
                .update({ ...updates })
                .eq("id", id);

            if (error) {
                console.error("Error updating post:", error);
                fetchPosts();
            } else {
                // Send notification
                const post = posts.find(p => p.id === id);
                if (post) {
                    const senderName = post.user_id === "him" ? "Anh" : "Em";
                    const recipientId = post.user_id === "him" ? "her" : "him";
                    sendNotification({
                        user_id: recipientId,
                        title: "Kỷ niệm đã cập nhật! ✍️",
                        body: `${senderName} vừa chỉnh sửa bài viết: "${post.title || 'Không có tiêu đề'}"`,
                        type: "timeline",
                        link: "timeline"
                    });
                }
            }
        },
        []
    );

    const deletePost = useCallback(
        async (id: string, mediaUrlsToCheck: string[]) => {
            // Optimistic update
            setPostsState((prev) => prev.filter((p) => p.id !== id));

            // 1. Delete from DB
            const { error } = await supabase.from("posts").delete().eq("id", id);

            if (error) {
                console.error("Error deleting post:", error);
                fetchPosts();
                return;
            }

            // 2. Delete media from R2 (Fire and forget, or handle errors silently)
            if (mediaUrlsToCheck.length > 0) {
                try {
                    await fetch("/api/delete-file", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileUrls: mediaUrlsToCheck }),
                    });
                } catch (err) {
                    console.error("Error deleting files from R2:", err);
                }
            }
        },
        []
    );

    const togglePostReaction = useCallback(async (postId: string, userId: string, emoji: string = "❤️") => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const currentReactions = post.reactions || {};
        const currentEmoji = currentReactions[userId];
        const newReactions = { ...currentReactions };

        if (currentEmoji === emoji) {
            delete newReactions[userId];
        } else {
            newReactions[userId] = emoji;
        }

        // Optimistic update
        setPostsState(prev => prev.map(p => p.id === postId ? { ...p, reactions: newReactions } : p));

        const { error } = await supabase
            .from("posts")
            .update({ reactions: newReactions })
            .eq("id", postId);

        if (error) {
            console.error("Error toggling post reaction:", error);
            fetchPosts();
        } else if (emoji !== currentEmoji && emoji) {
            // Send notification ONLY if a new reaction was added (not removed)
            const senderName = userId === "him" ? "Anh" : "Em";
            const recipientId = userId === "him" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Thả tim! ❤️",
                body: `${senderName} vừa bày tỏ cảm xúc "${emoji}" lên bài viết của bạn.`,
                type: "reaction",
                link: "timeline"
            });
        }
    }, [posts, fetchPosts]);

    return { posts, addPost, updatePost, deletePost, togglePostReaction };
}

export const useEvents = () => {
    const [events, setEvents] = useState<SpecialEvent[]>([]);

    const fetchEvents = useCallback(async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });

        if (error) {
            console.error("Error fetching events:", error);
            return;
        }

        if (data) {
            setEvents(data);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        void fetchEvents();
    }, [fetchEvents]);

    const addEvent = useCallback(async (event: Omit<SpecialEvent, "id">) => {
        // Optimistic
        const newEvent = { ...event, id: crypto.randomUUID() };
        setEvents(prev => [...prev, newEvent]);

        const { error } = await supabase.from("events").insert([event]);
        if (error) {
            console.error("Error adding event:", error);
            fetchEvents();
        }
    }, [fetchEvents]);

    const updateEvent = useCallback(async (id: string, updates: Partial<SpecialEvent>) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

        const { error } = await supabase.from("events").update(updates).eq("id", id);
        if (error) {
            console.error("Error updating event:", error);
            fetchEvents();
        }
    }, [fetchEvents]);

    const deleteEvent = useCallback(async (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));

        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) {
            console.error("Error deleting event:", error);
            fetchEvents();
        }
    }, [fetchEvents]);

    return { events, addEvent, updateEvent, deleteEvent };
};

export const useCountdowns = () => {
    const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
    const { role } = useCurrentUser();

    const fetchCountdowns = useCallback(async () => {
        const { data, error } = await supabase
            .from("countdowns")
            .select("*")
            .order("date", { ascending: true });

        if (error) {
            console.error("Error fetching countdowns:", error);
            return;
        }

        if (data) {
            setCountdowns(data);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        void fetchCountdowns();
    }, [fetchCountdowns]);

    const addCountdown = useCallback(async (countdown: Omit<CountdownEvent, "id">) => {
        // Optimistic
        const newCountdown = { ...countdown, id: crypto.randomUUID() };
        setCountdowns(prev => [...prev, newCountdown]);

        const { error } = await supabase.from("countdowns").insert([countdown]);
        if (error) {
            console.error("Error adding countdown:", error);
            fetchCountdowns();
        } else {
            // Send notification
            const senderName = role === "ảnh" ? "Anh" : "Em";
            const recipientId = role === "ảnh" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Sự kiện mới! 📅",
                body: `${senderName} vừa thêm một sự kiện countdown mới: "${countdown.title}"`,
                type: "countdown",
                link: "countdowns"
            });
        }
    }, [fetchCountdowns, role]);

    const updateCountdown = useCallback(async (id: string, updates: Partial<CountdownEvent>) => {
        setCountdowns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

        const { error } = await supabase.from("countdowns").update(updates).eq("id", id);
        if (error) {
            console.error("Error updating countdown:", error);
            fetchCountdowns();
        }
    }, [fetchCountdowns]);

    const deleteCountdown = useCallback(async (id: string) => {
        setCountdowns(prev => prev.filter(c => c.id !== id));

        const { error } = await supabase.from("countdowns").delete().eq("id", id);
        if (error) {
            console.error("Error deleting countdown:", error);
            fetchCountdowns();
        }
    }, [fetchCountdowns]);

    return { countdowns, addCountdown, updateCountdown, deleteCountdown };
};

/** Profiles (Shared via Supabase) */
export function useProfiles() {
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});

    const fetchProfiles = useCallback(async () => {
        console.log("Fetching profiles...");
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
            console.error("Error fetching profiles:", error);
            return;
        }
        if (data) {
            console.log("Profiles fetched:", data);
            const profileMap: Record<string, Profile> = {};
            data.forEach((p) => {
                profileMap[p.id] = p;
            });
            setProfiles(profileMap);
        }
    }, []);

    useEffect(() => {
        void fetchProfiles();

        const channel = supabase
            .channel("profiles_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "profiles" },
                () => {
                    fetchProfiles();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [fetchProfiles]);

    const updateProfile = useCallback(async (profile: Profile) => {
        console.log("Saving profile:", profile);
        // Optimistic update
        setProfiles((prev) => ({ ...prev, [profile.id]: profile }));

        try {
            const { data, error } = await supabase.from("profiles").upsert(profile).select();

            if (error) {
                console.error("Error updating profile (Supabase):", error);
                alert(`Lỗi lưu hồ sơ: ${error.message} (${error.code})`);
                fetchProfiles(); // Revert
                return false;
            }

            console.log("Profile updated successfully:", data);

            // Send notification to the other person
            const senderName = profile.id === "him" ? "Anh" : "Em";
            const recipientId = profile.id === "him" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Profile cập nhật! 👤",
                body: `${senderName} vừa cập nhật thông tin cá nhân.`,
                type: "profile",
                link: "profile"
            });

            return true;
        } catch (err) {
            console.error("Unexpected error updating profile:", err);
            alert("Lỗi không xác định khi lưu hồ sơ");
            fetchProfiles();
            return false;
        }
    }, [fetchProfiles]);

    return { profiles, updateProfile, refreshProfiles: fetchProfiles };
}

/** Notifications (Shared via Supabase) */
export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { role } = useCurrentUser();

    const fetchNotifications = useCallback(async () => {
        if (!role) return;
        const recipientId = role === "ảnh" ? "him" : "her";
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", recipientId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching notifications:", error);
        } else if (data) {
            setNotifications(data as AppNotification[]);
        }
    }, [role]);

    useEffect(() => {
        if (!role) return;
        void fetchNotifications();

        const channel = supabase
            .channel("notifications_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "valentine",
                    table: "notifications",
                    filter: `user_id=eq.${role === "ảnh" ? "him" : "her"}`,
                },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [role, fetchNotifications]);

    const addNotification = useCallback(async (payload: Omit<AppNotification, "id" | "is_read" | "created_at">) => {
        const { error } = await supabase
            .from("notifications")
            .insert([{ ...payload, is_read: false }]);

        if (error) {
            console.error("Error adding notification:", error);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) {
            console.error("Error marking notification as read:", error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        if (!role) return;
        const recipientId = role === "ảnh" ? "him" : "her";
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", recipientId)
            .eq("is_read", false);

        if (error) {
            console.error("Error marking all notifications as read:", error);
            fetchNotifications();
        }
    }, [role, fetchNotifications]);

    const deleteNotification = useCallback(async (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting notification:", error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    return { notifications, addNotification, markAsRead, markAllAsRead, deleteNotification };
}

/** Love Logic */
export function useLove(currentRole: "ảnh" | "ẻm") {
    const [loveCount, setLoveCount] = useState(0); // Count received from partner
    const [lastSentTime, setLastSentTime] = useState<number>(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    // Load last sent time from local storage
    useEffect(() => {
        const stored = getItem("valentine_last_love_sent", 0);
        setLastSentTime(stored);
    }, []);

    // Timer for cooldown
    useEffect(() => {
        if (lastSentTime === 0 && cooldownRemaining === 0) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - lastSentTime;
            if (diff < COOLDOWN_MS) {
                setCooldownRemaining(COOLDOWN_MS - diff);
            } else {
                setCooldownRemaining(0);
            }
        }, 1000);

        // Immediate check
        const now = Date.now();
        const diff = now - lastSentTime;
        if (diff < COOLDOWN_MS) {
            setCooldownRemaining(COOLDOWN_MS - diff);
        } else {
            setCooldownRemaining(0);
        }

        return () => clearInterval(interval);
    }, [lastSentTime]);

    // Fetch love count (received from other person)
    const fetchLoveCount = useCallback(async () => {
        // If I am 'him' (ảnh), I want to know how many times 'her' sent love.
        const sender = currentRole === "ảnh" ? "her" : "him";

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { count, error } = await supabase
            .from("love_logs")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", sender)
            .gte("created_at", todayStart.toISOString())
            .lte("created_at", todayEnd.toISOString());

        if (error) {
            console.error("Error fetching love count:", error);
        } else {
            console.log(`Fetched love count from ${sender}:`, count);
            setLoveCount(count || 0);
        }
    }, [currentRole]);

    useEffect(() => {
        void fetchLoveCount();

        // Subscribe to insertions in love_logs
        const channel = supabase
            .channel("love_logs_changes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "love_logs" },
                (payload) => {
                    const newLog = payload.new as { sender_id: string };
                    const senderToCheck = currentRole === "ảnh" ? "her" : "him";
                    if (newLog.sender_id === senderToCheck) {
                        fetchLoveCount();
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [fetchLoveCount, currentRole]);

    const sendLove = useCallback(async () => {
        const now = Date.now();
        if (now - lastSentTime < COOLDOWN_MS) {
            return false; // Still on cooldown
        }

        // Send: if I am 'ảnh', I am 'him' sending to DB
        const myId = currentRole === "ảnh" ? "him" : "her";

        // Optimistic cooldown
        const newTime = Date.now();
        setLastSentTime(newTime);
        setItem("valentine_last_love_sent", newTime);
        setCooldownRemaining(COOLDOWN_MS);

        const { error } = await supabase.from("love_logs").insert({ sender_id: myId });

        if (error) {
            console.error("Error sending love:", error);
            // Revert invalidation if needed, or just let it fail silently (cooldown already consumed locally)
            return false;
        } else {
            // Send notification
            const senderName = currentRole === "ảnh" ? "Anh" : "Em";
            const recipientId = currentRole === "ảnh" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Gửi ngàn lời yêu! 💖",
                body: `${senderName} vừa gửi cho bạn một trái tim.`,
                type: "love",
                link: "profile"
            });
        }
        return true;
    }, [currentRole, lastSentTime]);

    return { loveCount, sendLove, cooldownRemaining };
}

/** Love Statistics (Total Counts) */
export function useLoveStats() {
    const [stats, setStats] = useState<{ him: number; her: number }>({ him: 0, her: 0 });

    const fetchStats = useCallback(async () => {
        // Count for Him (received from Her)
        const { count: countForHim } = await supabase
            .from("love_logs")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", "her");

        // Count for Her (received from Him)
        const { count: countForHer } = await supabase
            .from("love_logs")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", "him");

        setStats({
            him: countForHim || 0,
            her: countForHer || 0
        });
    }, []);

    useEffect(() => {
        void fetchStats();

        const channel = supabase
            .channel("love_stats_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "love_logs" },
                () => {
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [fetchStats]);

    return stats;
}

export function usePostComments(postId: string) {
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchComments = useCallback(async () => {
        if (!postId) return;
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("post_id", postId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(`Error fetching comments for post ${postId}:`, error);
        } else if (data) {
            console.log(`Fetched ${data.length} comments for post ${postId}:`, data);
            // Ensure reactions is object not null
            const formatted = data.map(c => ({
                ...c,
                reactions: c.reactions || {}
            }));
            setComments(formatted as Comment[]);
        }
    }, [postId]);

    useEffect(() => {
        if (!postId) return;

        void fetchComments();

        const channel = supabase
            .channel(`comments_post_${postId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "valentine",
                    table: "comments",
                    filter: `post_id=eq.${postId}`,
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [postId, fetchComments]);

    const addComment = useCallback(async (content: string, userId: string) => {
        if (!content.trim()) return;

        // Optimistic
        const tempId = crypto.randomUUID();
        const newComment: Comment = {
            id: tempId,
            post_id: postId,
            user_id: userId,
            content,
            reactions: {},
            created_at: new Date().toISOString(),
        };

        setComments(prev => [newComment, ...prev]);

        const { error } = await supabase.from("comments").insert({
            id: tempId,
            post_id: postId,
            user_id: userId,
            content: content
        });

        if (error) {
            console.error("Error adding comment:", error);
            setComments(prev => prev.filter(c => c.id !== tempId));
        } else {
            // Send notification to the other person 
            const senderName = userId === "him" ? "Anh" : "Em";
            const recipientId = userId === "him" ? "her" : "him";
            sendNotification({
                user_id: recipientId,
                title: "Bình luận mới! 💬",
                body: `${senderName} vừa bình luận: "${content.trim()}"`,
                type: "comment",
                link: "timeline"
            });
        }
    }, [postId]);

    const toggleReaction = useCallback(async (commentId: string, userId: string, emoji: string) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        const currentReaction = comment.reactions?.[userId];
        const newReactions = { ...(comment.reactions || {}) };

        if (currentReaction === emoji) {
            delete newReactions[userId];
        } else {
            newReactions[userId] = emoji;
        }

        // Optimistic
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, reactions: newReactions } : c));

        const { error } = await supabase
            .from("comments")
            .update({ reactions: newReactions })
            .eq("id", commentId);

        if (error) {
            console.error("Error toggling reaction:", error);
            // Revert
            const revertReactions = { ...comment.reactions };
            if (currentReaction) {
                revertReactions[userId] = currentReaction;
            } else {
                delete revertReactions[userId];
            }
            const revertedComment = { ...comment, reactions: revertReactions };
            setComments(prev => prev.map(c => c.id === commentId ? revertedComment : c));
        }
    }, [comments]);

    const deleteComment = useCallback(async (commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
        await supabase.from("comments").delete().eq("id", commentId);
    }, []);

    return { comments, addComment, toggleReaction, deleteComment };
}

/** Greetings (Shared via Supabase) */
export interface Greeting {
    id: string;
    content: string;
    time_of_day: "morning" | "afternoon" | "evening" | "night";
    author_id: "him" | "her";
    created_at?: string;
}

export function useGreetings() {
    const [greetings, setGreetings] = useState<Greeting[]>([]);

    const fetchGreetings = useCallback(async () => {
        const { data, error } = await supabase
            .from("greetings")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching greetings:", error);
        } else if (data) {
            setGreetings(data as Greeting[]);
        }
    }, []);

    useEffect(() => {
        void fetchGreetings();

        const channel = supabase
            .channel("greetings_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "valentine", table: "greetings" },
                () => {
                    fetchGreetings();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [fetchGreetings]);

    const addGreeting = useCallback(async (content: string, timeOfDay: string, authorId: string) => {
        const tempId = crypto.randomUUID();
        const newGreeting: Greeting = {
            id: tempId,
            content,
            time_of_day: timeOfDay as any,
            author_id: authorId as any,
            created_at: new Date().toISOString(),
        };

        setGreetings(prev => [newGreeting, ...prev]);

        const { error } = await supabase.from("greetings").insert({
            id: tempId,
            content,
            time_of_day: timeOfDay,
            author_id: authorId
        });

        if (error) {
            console.error("Error adding greeting:", error);
            setGreetings(prev => prev.filter(g => g.id !== tempId));
        }
    }, []);

    const deleteGreeting = useCallback(async (id: string) => {
        setGreetings(prev => prev.filter(g => g.id !== id));
        const { error } = await supabase.from("greetings").delete().eq("id", id);
        if (error) {
            console.error("Error deleting greeting:", error);
            // Revert logic could be added here if needed, but simple delete usually safe enough
            fetchGreetings();
        }
    }, [fetchGreetings]);

    return { greetings, addGreeting, deleteGreeting };
}



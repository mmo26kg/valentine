export type UserRole = "him" | "her";

export interface User {
    id: string;
    name: string;
    avatar_url: string | null;
    role: UserRole;
    bio?: string;
    personality_tags?: string[];
    likes?: string[];
    dislikes?: string[];
}

export interface DailyCaption {
    id: string;
    user_id: string;
    date: string;
    content: string;
    created_at: string;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    reactions: Record<string, string>; // { "him": "❤️", "her": "👍" }
    created_at: string;
}

export interface TimelinePost {
    id: string;
    user_id: string;
    title: string;
    content: string;
    media_url: string | null;
    media_urls?: string[]; // New field for multiple images
    event_date: string;
    type: "photo" | "video" | "text" | "milestone";
    reactions?: Record<string, string>; // { "him": "❤️", "her": "👍" }
    created_at: string;
    location?: string;
    user?: User;
    comments?: Comment[]; // Optional for UI consumption
}

export interface CoupleSettings {
    id: string;
    password_hash: string;
    start_date: string;
    him_id: string | null;
    her_id: string | null;
}

export interface CountdownEvent {
    id: string;
    title: string;
    date: string;
    icon: string;
    type: "sinh nhật" | "kỷ niệm" | "ngày lễ" | "khác";
    description?: string;
    image_url?: string;
}

export interface SpecialEvent {
    id: string;
    title: string;
    date: string;
    message: string;
    icon: string;
}

export interface Profile {
    id: string; // 'him' | 'her'
    name: string;
    avatar_url: string | null;
    tagline?: string; // New field
    bio?: string;
    personality_tags?: string[];
    likes?: string[];
    dislikes?: string[];
    password?: string;
}

export interface LoveLog {
    id: string;
    sender_id: string;
    created_at: string;
}

export interface AppNotification {
    id: string;
    user_id: string;
    title: string;
    body: string;
    type?: string;
    link?: string;
    is_read: boolean;
    notification_key?: string;
    created_at: string;
}

export interface Greeting {
    id: string;
    content: string;
    time_of_day: "morning" | "afternoon" | "evening" | "night";
    author_id: "him" | "her";
    created_at?: string;
}

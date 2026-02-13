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

export interface TimelinePost {
    id: string;
    user_id: string;
    title: string;
    content: string;
    media_url: string | null;
    event_date: string;
    type: "photo" | "video" | "text" | "milestone";
    created_at: string;
    location?: string;
    user?: User;
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
    type: "birthday" | "anniversary" | "holiday" | "custom";
    description?: string;
    image_url?: string;
}

export interface SpecialEvent {
    name: string;
    date: string;
    title: string;
    message: string;
    icon: string;
}

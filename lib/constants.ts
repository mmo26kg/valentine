import { SpecialEvent, CountdownEvent } from "./types";

// ─── Default Couple Data ───
export const DEFAULT_START_DATE = "2024-02-14";
export const DEFAULT_PASSWORD = "1402"; // Valentine's Day format ddmm

// ─── Special Events ───
export const SPECIAL_EVENTS: SpecialEvent[] = [
    {
        name: "valentine",
        date: "02-14",
        title: "Happy Valentine's Day",
        message:
            "To my partner in crime and my greatest love.\nHere is to celebrating us today and every day.",
        icon: "💕",
    },
    {
        name: "women",
        date: "03-08",
        title: "Happy Women's Day",
        message:
            "You are the most beautiful soul I know.\nToday and every day, I celebrate you.",
        icon: "🌹",
    },
    {
        name: "christmas",
        date: "12-25",
        title: "Merry Christmas, My Love",
        message:
            "The greatest gift I ever received is you.\nMerry Christmas, my darling.",
        icon: "🎄",
    },
    {
        name: "newyear",
        date: "01-01",
        title: "Happy New Year Together",
        message:
            "Another year of love, laughter, and memories.\nHere's to our forever.",
        icon: "🎆",
    },
];

// ─── Default Countdown Events ───
export const DEFAULT_COUNTDOWN_EVENTS: CountdownEvent[] = [
    {
        id: "1",
        title: "Valentine's Day",
        date: "2026-02-14",
        icon: "heart",
        type: "holiday",
        description: "Our special day of love",
    },
    {
        id: "2",
        title: "Anniversary",
        date: "2025-04-19",
        icon: "diamond",
        type: "anniversary",
        description: "The day it all began",
    },
    {
        id: "3",
        title: "Sinh nhật Ẻm",
        date: "2026-05-10",
        icon: "cake",
        type: "birthday",
        description: "Make it unforgettable",
    },
    {
        id: "4",
        title: "Sinh nhật Ảnh",
        date: "2026-06-26",
        icon: "gift",
        type: "birthday",
        description: "A day to celebrate him",
    },
];

// ─── Sample Timeline Posts ───
export const SAMPLE_TIMELINE_POSTS = [
    {
        id: "1",
        user_id: "him",
        title: "Valentine's Dinner",
        content:
            "The night we decided to move in together. The jazz band was playing our song, and the cocktails were perfect.",
        media_url:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
        event_date: "2025-02-14",
        type: "photo" as const,
        created_at: "2025-02-14",
        location: "San Francisco, CA",
    },
    {
        id: "2",
        user_id: "her",
        title: "Paris Trip",
        content:
            "Paris was everything we dreamed of. Waking up to the smell of fresh croissants and exploring the winding streets of Montmartre.",
        media_url:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
        event_date: "2025-01-05",
        type: "photo" as const,
        created_at: "2025-01-05",
        location: "Paris, France",
    },
    {
        id: "3",
        user_id: "her",
        title: "The Surprise Gift",
        content:
            "I still can't believe you found the first edition of my favorite book. It was the most thoughtful gift anyone has ever given me. I cried happy tears all morning.",
        media_url: null,
        event_date: "2024-12-25",
        type: "text" as const,
        created_at: "2024-12-25",
        location: "Home",
    },
    {
        id: "4",
        user_id: "him",
        title: "Hiking Adventure",
        content:
            "Reached the summit just in time for sunset. Worth every step.",
        media_url:
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
        event_date: "2024-11-12",
        type: "photo" as const,
        created_at: "2024-11-12",
        location: "Yosemite National Park",
    },
];

// ─── Sample Users ───
export const SAMPLE_USERS = {
    him: {
        id: "ảnh",
        name: "Pink Duck 🏹",
        avatar_url: null,
        role: "him" as const,
        bio: "Là 1 BA và 1 lập trình diên tham dọng. Nghiện cafe và thích ăn cay",
        personality_tags: ["Tham dọng", "Vloger", "Cafe", "Ớt"],
        likes: ["Rainy days", "Vintage vinyls", "Spicy food"],
        dislikes: ["Heavy traffic", "Cold coffee", "Dishonesty"],
    },
    her: {
        id: "ẻm",
        name: "Mĩn Bì 💘",
        avatar_url: null,
        role: "her" as const,
        bio: "1 BA mới nhú, dễ nhạy cảm, hong thích đi làm nhưng muốn có nhiều tiền, thích dọn dẹp, hong thích ra đường - lâu lâu cũng có thích.",
        personality_tags: ["BA", "Dễ nhạy cảm", "Thích dọn dẹp", "Thích ra đường"],
        likes: ["Handwritten letters", "Piano music", "Wildflowers"],
        dislikes: ["Conflict", "Spiders", "Rushing"],
    },
};

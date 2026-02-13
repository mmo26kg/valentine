"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    Diamond,
    Cake,
    Gift,
    CalendarHeart,
    Plus,
    Sparkles,
} from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import { DEFAULT_COUNTDOWN_EVENTS } from "@/lib/constants";
import type { CountdownEvent } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
    heart: Heart,
    diamond: Diamond,
    cake: Cake,
    gift: Gift,
    calendar: CalendarHeart,
    sparkles: Sparkles,
};

function getTimeRemaining(targetDate: string) {
    const now = new Date();
    const target = new Date(targetDate);

    // If event has passed this year, show next year
    if (target < now) {
        target.setFullYear(target.getFullYear() + 1);
    }

    const days = differenceInDays(target, now);
    const hours = differenceInHours(target, now) % 24;
    const minutes = differenceInMinutes(target, now) % 60;

    return { days, hours, minutes, isPast: false };
}

export function CountdownTab() {
    const [events] = useState<CountdownEvent[]>(DEFAULT_COUNTDOWN_EVENTS);
    const [, setTick] = useState(0);

    // Re-render every minute for live countdown
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    const today = format(new Date(), "MMMM d");

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <p className="text-rose-gold text-lg italic font-serif mb-1">
                        Chào bạn yêu
                    </p>
                    <h1 className="text-4xl md:text-5xl font-light text-white">
                        Sự kiện sắp tới
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-3xl font-light text-rose-gold/80 font-serif">
                        {today}
                    </p>
                    <p className="text-sm text-white/30 uppercase tracking-widest">
                        Hôm nay
                    </p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <div className="bg-rose-gold/10 p-2 rounded-lg">
                        <CalendarHeart className="w-5 h-5 text-rose-gold" />
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                            Đang diễn ra
                        </p>
                        <p className="text-xl font-medium text-white">
                            {events.length} Sự kiện
                        </p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <div className="bg-rose-gold/10 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-rose-gold" />
                    </div>
                    <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                            Tiếp theo
                        </p>
                        <p className="text-xl font-medium text-white">
                            {events[0]?.title || "—"}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => {
                    const time = getTimeRemaining(event.date);
                    const Icon = ICON_MAP[event.icon] || Heart;
                    const isFeature = i === 0;

                    return (
                        <motion.div
                            key={event.id}
                            className={`group relative glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[260px] ${isFeature ? "md:col-span-2" : ""
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                        >
                            {/* Decorative glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-gold/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-rose-gold/10 p-2 rounded-lg">
                                        <Icon className="w-5 h-5 text-rose-gold" />
                                    </div>
                                    <span className="text-xs text-rose-gold/50 border border-rose-gold/10 px-2 py-0.5 rounded-full capitalize">
                                        {event.type}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl text-white font-light">{event.title}</h3>
                                    <p className="text-sm text-white/40">
                                        {format(new Date(event.date), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>

                            {/* Countdown Display */}
                            <div className={`relative z-10 ${isFeature ? "flex gap-8 mt-4" : "mt-6"}`}>
                                {isFeature ? (
                                    <>
                                        <div className="text-center">
                                            <span className="block text-5xl md:text-7xl font-light text-rose-gold text-glow leading-none font-serif">
                                                {time.days}
                                            </span>
                                            <span className="text-xs uppercase tracking-[0.2em] text-white/30 mt-2 block">
                                                Ngày
                                            </span>
                                        </div>
                                        <div className="h-auto w-px bg-rose-gold/10" />
                                        <div className="text-center">
                                            <span className="block text-5xl md:text-7xl font-light text-rose-gold/60 leading-none font-serif">
                                                {time.hours}
                                            </span>
                                            <span className="text-xs uppercase tracking-[0.2em] text-white/30 mt-2 block">
                                                Giờ
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center bg-background/30 rounded-xl p-4 border border-rose-gold/5">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-light text-rose-gold text-glow font-serif">
                                                {time.days}
                                            </span>
                                            <span className="text-lg text-rose-gold/40">d</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                                            <motion.div
                                                className="bg-rose-gold h-full shadow-[0_0_10px_rgba(201,160,160,0.6)]"
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${Math.max(5, 100 - (time.days / 365) * 100)}%`,
                                                }}
                                                transition={{ duration: 1, delay: 0.3 * i }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/30 mt-2 text-right">
                                            {time.days < 7 ? "Sắp đến rồi!" : time.days < 30 ? "Đang đến gần!" : "Sắp tới"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isFeature && event.description && (
                                <p className="text-white/30 italic font-light font-serif mt-4 relative z-10">
                                    &ldquo;{event.description}&rdquo;
                                </p>
                            )}
                        </motion.div>
                    );
                })}

                {/* Add New Card */}
                <motion.button
                    className="group border-2 border-dashed border-rose-gold/15 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:border-rose-gold/40 hover:bg-rose-gold/5 transition-all duration-300 min-h-[260px]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="h-16 w-16 rounded-full bg-rose-gold/10 flex items-center justify-center group-hover:bg-rose-gold group-hover:shadow-[0_0_20px_rgba(201,160,160,0.5)] transition-all duration-300">
                        <Plus className="w-7 h-7 text-rose-gold group-hover:text-background transition-colors" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-light text-rose-gold font-serif">
                            Thêm cột mốc mới
                        </h3>
                        <p className="text-sm text-white/30 mt-1">
                            Tạo kỷ niệm mới để cùng mong chờ
                        </p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
}

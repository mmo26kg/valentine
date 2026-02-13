"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    MapPin,
    Lock,
    Send,
    Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays, format } from "date-fns";

interface HomeTabProps {
    startDate: string;
    currentRole: "ảnh" | "ẻm";
    partnerName: string;
    myCaption: string;
    partnerCaption: string;
    hasWrittenToday: boolean;
    onSubmitCaption: (content: string) => void;
}

export function HomeTab({
    startDate,
    currentRole,
    partnerName,
    myCaption,
    partnerCaption,
    hasWrittenToday,
    onSubmitCaption,
}: HomeTabProps) {
    const [captionText, setCaptionText] = useState("");
    const today = useMemo(() => new Date(), []);
    const daysTogether = useMemo(
        () => differenceInDays(today, new Date(startDate)),
        [startDate, today]
    );

    const handleSubmit = () => {
        if (!captionText.trim()) return;
        onSubmitCaption(captionText.trim());
        setCaptionText("");
    };

    return (
        <div className="space-y-10 grid grid-cols-1 md:grid-cols-2 gap-24 max-w-4xl mx-auto">
            <div className="space-y-4 col-span-1">
                {/* Hero: Days Counter */}
                <motion.div
                    className="text-center space-y-2 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-rose-gold/70 text-sm tracking-[0.3em] uppercase italic font-serif">
                        Đã bên nhau
                    </p>
                    <div className="flex items-baseline justify-center gap-3">
                        <motion.span
                            className="text-7xl md:text-8xl font-serif text-white font-light text-glow"
                            key={daysTogether}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            {daysTogether.toLocaleString()}
                        </motion.span>
                        <span className="text-3xl md:text-4xl text-rose-gold/60 font-serif italic">
                            Ngày
                        </span>
                    </div>
                </motion.div>

                {/* Couple Photo */}
                <motion.div
                    className="relative w-full max-w-sm mx-auto aspect-3/4 rounded-xl overflow-hidden border border-rose-gold/10 shadow-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <Image
                        src="https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/IMG_1364.jpg"
                        alt="Couple"
                        fill
                        className="object-cover opacity-90"

                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 text-sm">
                        <MapPin className="w-4 h-4 text-rose-gold" />
                        <span className="font-serif italic">Our Journey</span>
                    </div>
                </motion.div>
            </div>

            {/* Daily Note Section */}
            <motion.div
                className="space-y-4 col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif italic text-white">Daily Note</h2>
                    <span className="text-rose-gold/50 text-sm border border-rose-gold/10 px-3 py-1 rounded-full font-serif">
                        {format(today, "MMMM d, yyyy")}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* Your Note */}
                    <div className="glass-card rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-gold/20 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-rose-gold" />
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {hasWrittenToday ? "Note của bạn" : "Đến lượt bạn"}
                                </p>
                                <p className="text-white/40 text-sm">
                                    {hasWrittenToday
                                        ? "Đã chia sẻ hôm nay"
                                        : `Chia sẻ suy nghĩ của bạn để mở khóa ${currentRole === "ẻm" ? "của ẻm" : "của ảnh"}.`}
                                </p>
                            </div>
                        </div>

                        {hasWrittenToday ? (
                            <div className="bg-background/30 rounded-lg p-4 border border-rose-gold/5">
                                <p className="text-white/70 font-serif italic">{myCaption}</p>
                            </div>
                        ) : (
                            <>
                                <Textarea
                                    placeholder="What made you smile today?"
                                    value={captionText}
                                    onChange={(e) => setCaptionText(e.target.value)}
                                    className="bg-background/30 border-rose-gold/10 min-h-[100px] resize-none text-white placeholder:text-white/20 focus-visible:ring-rose-gold/30 font-serif"
                                />
                                <div className="flex items-center justify-between">
                                    <button className="text-white/20 hover:text-rose-gold transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!captionText.trim()}
                                        className="bg-rose-gold hover:bg-rose-gold-dark text-background font-serif disabled:opacity-30"
                                    >
                                        Share Note
                                        <Send className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Partner's Note */}
                    <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
                        {hasWrittenToday && partnerCaption ? (
                            <motion.div
                                className="text-center space-y-2 p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <p className="text-white/70 font-serif italic text-lg">
                                    &ldquo;{partnerCaption}&rdquo;
                                </p>
                                <p className="text-rose-gold/40 text-sm">
                                    — {partnerName}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-14 h-14 rounded-full bg-rose-gold/10 flex items-center justify-center mx-auto">
                                    <Lock className="w-6 h-6 text-rose-gold/50" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {partnerName}&apos;s Note is Locked
                                    </p>
                                    <p className="text-white/40 text-sm mt-1 max-w-[240px]">
                                        {hasWrittenToday
                                            ? `Waiting for ${partnerName} to share today...`
                                            : `Share your daily moment to unlock what ${partnerName} wrote for you today.`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-rose-gold/40 text-xs tracking-widest uppercase">
                                    <span className="w-2 h-2 rounded-full bg-rose-gold/30 animate-pulse" />
                                    Waiting For You
                                </div>
                            </div>
                        )}

                        {/* Blur overlay when locked */}
                        {!hasWrittenToday && partnerCaption && (
                            <div className="absolute inset-0 backdrop-blur-lg bg-surface/50 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-rose-gold/30" />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Quick Links */}
            {/* <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                {[
                    { icon: HeartHandshake, label: "Date Ideas" },
                    { icon: Music, label: "Our Playlist" },
                    { icon: ImageIcon, label: "Memories" },
                    { icon: CalendarHeart, label: "Calendar" },
                ].map(({ icon: Icon, label }) => (
                    <button
                        key={label}
                        className="glass-card glass-card-hover rounded-xl p-6 flex flex-col items-center gap-3 text-white/60 hover:text-rose-gold transition-all group"
                    >
                        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-serif">{label}</span>
                    </button>
                ))}
            </motion.div> */}
        </div>
    );
}

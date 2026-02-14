"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { FallingHearts } from "@/components/shared/falling-hearts";
import { useEvents } from "@/lib/store";

interface EventScreenProps {
    onDismiss: () => void;
}

export function EventScreen({ onDismiss }: EventScreenProps) {
    const { events } = useEvents();
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
    ).padStart(2, "0")}`;

    const event = useMemo(
        () => events.find((e) => e.date === monthDay),
        [events, monthDay]
    );

    if (!event) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <AmbientBackground />
            <FallingHearts count={20} />

            {/* Skip Button */}
            <button
                onClick={onDismiss}
                className="absolute top-6 right-6 z-50 flex items-center gap-2 text-rose-gold/40 hover:text-rose-gold transition-colors text-sm tracking-widest uppercase"
            >
                <Heart className="w-4 h-4" />
                Skip Intro
                <X className="w-4 h-4" />
            </button>

            <motion.div
                className="z-10 text-center px-6 max-w-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                {/* Icon */}
                <motion.div
                    className="mx-auto mb-8 w-20 h-20 rounded-full bg-surface border border-rose-gold/20 flex items-center justify-center shadow-[0_0_40px_rgba(201,160,160,0.15)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <span className="text-3xl">{event.icon}</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="font-serif text-5xl md:text-7xl italic text-white mb-6 leading-tight text-glow-strong"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    {event.title.split(",").map((part, i) => (
                        <span key={i}>
                            {i > 0 && <br />}
                            {part}
                        </span>
                    ))}
                </motion.h1>

                {/* Message */}
                <motion.p
                    className="text-white/50 text-lg md:text-xl font-light leading-relaxed mb-12 font-serif"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {event.message.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            {i === 0 && <br />}
                        </span>
                    ))}
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                >
                    <Button
                        onClick={onDismiss}
                        size="lg"
                        className="bg-rose-gold hover:bg-rose-gold-dark text-background px-10 py-6 text-base font-serif tracking-wide shadow-lg shadow-rose-gold/20 group"
                    >
                        Tiếp tục đến không gian của chúng ta
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>

                <motion.p
                    className="text-rose-gold/20 text-sm italic mt-6 font-serif"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                >
                    Những kỉ niệm của chúng ta đang chờ...
                </motion.p>
            </motion.div>
        </motion.div>
    );
}

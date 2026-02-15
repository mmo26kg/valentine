"use client";

import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelinePost {
    id: string;
    event_date: string;
}

interface TimelineScrubberProps {
    posts: TimelinePost[];
    className?: string;
}

export function TimelineScrubber({ posts, className }: TimelineScrubberProps) {
    const [activeDate, setActiveDate] = useState<string | null>(null);
    const [isInteracting, setIsInteracting] = useState(false);

    // key: YYYY-MM
    const groupedMonths = useMemo(() => {
        const months = new Set<string>();
        posts.forEach(post => {
            if (post.event_date) {
                months.add(post.event_date.substring(0, 7)); // "YYYY-MM"
            }
        });
        return Array.from(months).sort().reverse();
    }, [posts]);

    const handleScrollTo = (yearMonth: string) => {
        const element = document.getElementById(`timeline-${yearMonth}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveDate(yearMonth);
        }
    };

    // Handle touch/drag to scrub
    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        setIsInteracting(true);
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        // Find the element under the cursor/finger
        const element = document.elementFromPoint(window.innerWidth - 20, clientY); // Approx X position
        const dateTarget = element?.getAttribute("data-date");

        if (dateTarget && dateTarget !== activeDate) {
            handleScrollTo(dateTarget);
            // Haptic feedback if available?
            if (navigator.vibrate) navigator.vibrate(5);
        }
    };

    const handleInteractionEnd = () => {
        setIsInteracting(false);
        setTimeout(() => setActiveDate(null), 1000);
    };

    if (groupedMonths.length < 2) return null;

    return (
        <div
            className={cn("fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-1 select-none touch-none", className)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleInteractionEnd}
            onMouseMove={(e) => e.buttons === 1 && handleTouchMove(e)}
            onMouseUp={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
        >
            {groupedMonths.map((date) => {
                const isActive = activeDate === date;
                const [year, month] = date.split("-");
                const label = `T${parseInt(month)}/${year}`;

                return (
                    <div
                        key={date}
                        className="group flex items-center justify-end gap-2 pr-1 py-0.5"
                        data-date={date}
                        onClick={() => handleScrollTo(date)}
                    >
                        <AnimatePresence>
                            {(isActive || isInteracting) && (
                                <motion.span
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="text-[10px] font-serif font-bold text-primary bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap pointer-events-none"
                                >
                                    {label}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        <div
                            className={cn(
                                "rounded-full transition-all duration-300 relative",
                                isActive
                                    ? "w-3 h-3 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                    : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-primary/60 hover:w-2 hover:h-2"
                            )}
                            data-date={date}
                        />
                    </div>
                );
            })}
        </div>
    );
}

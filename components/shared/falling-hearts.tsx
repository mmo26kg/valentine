"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FallingHeartsProps {
    count?: number;
}

export function FallingHearts({ count = 15 }: FallingHeartsProps) {
    const [hearts, setHearts] = useState<
        Array<{
            id: number;
            left: number;
            size: number;
            delay: number;
            duration: number;
            opacity: number;
            filled: boolean;
        }>
    >([]);

    useEffect(() => {
        const h = Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 16 + 10,
            delay: Math.random() * 8,
            duration: Math.random() * 6 + 6,
            opacity: Math.random() * 0.3 + 0.1,
            filled: Math.random() > 0.5,
        }));
        setTimeout(() => setHearts(h), 0);
    }, [count]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
            {hearts.map((h) => (
                <motion.div
                    key={h.id}
                    className="absolute"
                    style={{ left: `${h.left}%`, top: "-5%" }}
                    animate={{
                        y: ["0vh", "110vh"],
                        rotate: [0, 360],
                        opacity: [h.opacity, h.opacity, 0],
                    }}
                    transition={{
                        duration: h.duration,
                        repeat: Infinity,
                        delay: h.delay,
                        ease: "linear",
                    }}
                >
                    <Heart
                        size={h.size}
                        className="text-rose-gold"
                        fill={h.filled ? "currentColor" : "none"}
                        strokeWidth={1}
                    />
                </motion.div>
            ))}
        </div>
    );
}

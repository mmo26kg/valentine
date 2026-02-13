"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Top-left rose glow */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-rose-gold/15 blur-[120px] rounded-full"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Bottom-right glow */}
            <motion.div
                className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-rose-gold/8 blur-[100px] rounded-full"
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />
            {/* Center ambient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ambient-glow" />
        </div>
    );
}

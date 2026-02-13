"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/shared/ambient-background";

interface LoveCaptchaProps {
    onPass: () => void;
}

export function LoveCaptcha({ onPass }: LoveCaptchaProps) {
    const [checked, setChecked] = useState(false);
    const [showHearts, setShowHearts] = useState(false);
    const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
    const [heartParticles, setHeartParticles] = useState<
        Array<{
            x: number;
            y: number;
            rotation: number;
            size: number;
        }>
    >([]);
    const noButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const runAway = useCallback(() => {
        if (!containerRef.current) return;
        const container = containerRef.current.getBoundingClientRect();
        const maxX = container.width - 160;
        const maxY = 100;
        const newX = Math.random() * maxX - maxX / 2;
        const newY = Math.random() * maxY - maxY / 2;
        setNoPosition({ x: newX, y: newY });
    }, []);

    const handleYes = () => {
        if (!checked) return;

        // Generate heart particles
        const particles = Array.from({ length: 30 }).map(() => ({
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600,
            rotation: Math.random() * 360,
            size: Math.random() * 24 + 12
        }));
        setHeartParticles(particles);

        setShowHearts(true);
        // Play heart burst sound
        try {
            const audio = new Audio("/sounds/heart-burst.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch { }
        setTimeout(onPass, 2000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <AmbientBackground />

            {/* Heart Burst */}
            <AnimatePresence>
                {showHearts && (
                    <div className="fixed inset-0 z-50 pointer-events-none">
                        {heartParticles.map((particle, i) => (
                            <motion.div
                                key={i}
                                className="absolute"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                }}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1.5, 0],
                                    x: particle.x,
                                    y: particle.y,
                                    opacity: [1, 1, 0],
                                    rotate: particle.rotation,
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.05,
                                    ease: "easeOut",
                                }}
                            >
                                <Heart
                                    className="text-rose-gold"
                                    fill="currentColor"
                                    size={particle.size}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                ref={containerRef}
                className="z-10 w-full max-w-md mx-auto px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Glass Card */}
                <div className="glass-card rounded-xl p-8 md:p-12 shadow-2xl">
                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-gold/10 border border-rose-gold/20 text-rose-gold text-sm tracking-wide">
                            <Lock className="w-4 h-4" />
                            <span className="uppercase text-xs">Xác nhận tình yêu</span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="text-center mb-10 space-y-4">
                        <h1 className="text-4xl md:text-5xl italic font-serif text-white leading-tight">
                            Em có yêu{" "}
                            <br />
                            <span className="text-rose-gold">anh không?</span>
                        </h1>
                        <p className="text-white/40 text-lg font-light">
                            Vui lòng xác nhận cảm xúc.
                        </p>
                    </div>

                    {/* Captcha Checkbox */}
                    <div
                        className="bg-background/50 rounded-lg p-4 border border-white/5 mb-8 flex items-center gap-4 cursor-pointer hover:border-rose-gold/20 transition-colors group"
                        onClick={() => setChecked(!checked)}
                    >
                        <div className="relative flex items-center justify-center">
                            <motion.div
                                className={`w-7 h-7 border-2 rounded flex items-center justify-center transition-all ${checked
                                    ? "bg-rose-gold border-rose-gold"
                                    : "border-white/20 bg-transparent"
                                    }`}
                                whileTap={{ scale: 0.9 }}
                            >
                                <AnimatePresence>
                                    {checked && (
                                        <motion.svg
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="w-5 h-5 text-background"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                        <span className="text-white/70 font-light group-hover:text-rose-gold transition-colors select-none text-md">
                            Tôi xin chịu trách nhiệm với câu trả lời của mình
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 w-full">
                        {/* No Button — runs away */}
                        <motion.div
                            className="flex-1"
                            animate={noPosition}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Button
                                ref={noButtonRef}
                                variant="outline"
                                className="w-full py-6 border-white/10 text-white/40 hover:text-white hover:bg-white/5 tracking-[0.2em] uppercase text-sm font-medium"
                                onMouseEnter={runAway}
                                onTouchStart={runAway}
                                onClick={runAway}
                            >
                                Không
                            </Button>
                        </motion.div>

                        {/* Yes Button */}
                        <Button
                            onClick={handleYes}
                            disabled={!checked}
                            className="flex-1 py-6 bg-rose-gold hover:bg-rose-gold-dark text-background shadow-lg shadow-rose-gold/20 hover:shadow-rose-gold/40 tracking-[0.2em] uppercase text-sm font-semibold disabled:opacity-30 transition-all"
                        >
                            Có{" "}
                            <Heart className="w-4 h-4 ml-1 inline" fill="currentColor" />
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-white/15 tracking-[0.2em] uppercase font-light">
                            Được bảo vệ bởi <p className="text-rose-gold text-xs">Hội đồng tình yêu vũ trụ</p>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmbientBackground } from "@/components/shared/ambient-background";

interface SecretLockProps {
    onUnlock: () => void;
    onSelectRole: (role: "ảnh" | "ẻm") => void;
    currentRole: "ảnh" | "ẻm";
    correctPassword: string;
}

export function SecretLockScreen({
    onUnlock,
    onSelectRole,
    currentRole,
    correctPassword,
}: SecretLockProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            onUnlock();
        } else {
            setError(true);
            setShowHint(true);
            setTimeout(() => setError(false), 600);
            setPassword("");
            inputRef.current?.focus();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <AmbientBackground />

            <motion.div
                className="z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Together Since */}
                <motion.p
                    className="text-primary/60 text-sm tracking-[0.3em] uppercase font-sans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Bên nhau từ 2025
                </motion.p>

                {/* Avatar Selection */}
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={() => onSelectRole("ảnh")}
                        className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${currentRole === "ảnh"
                            ? "border-primary shadow-[0_0_20px_var(--primary-glow)]"
                            : "border-border opacity-60 hover:opacity-80"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            {/* <User className="w-8 h-8 text-primary" /> */}
                            <img src="https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/A%CC%89nh%20ma%CC%80n%20hi%CC%80nh.PNG" alt="anh" className="w-full h-full object-cover object-center text-primary" />
                        </div>
                        {currentRole === "ảnh" && (
                            <motion.div
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <Heart className="w-3 h-3 text-primary-foreground" fill="currentColor" />
                            </motion.div>
                        )}
                    </motion.button>

                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Heart
                            className="w-6 h-6 text-primary"
                            fill="currentColor"
                        />
                    </motion.div>

                    <motion.button
                        onClick={() => onSelectRole("ẻm")}
                        className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${currentRole === "ẻm"
                            ? "border-primary shadow-[0_0_20px_var(--primary-glow)]"
                            : "border-border opacity-60 hover:opacity-80"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            {/* <User className="w-8 h-8 text-primary" /> */}
                            <img src="https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/IMG_A67177C3D2B4-1.jpeg" alt="anh" className="w-full h-full text-primary" />
                        </div>
                        {currentRole === "ẻm" && (
                            <motion.div
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <Heart className="w-3 h-3 text-primary-foreground" fill="currentColor" />
                            </motion.div>
                        )}
                    </motion.button>
                </div>

                {/* Lock Card */}
                <motion.div
                    className="glass-card rounded-xl p-8 w-full shadow-2xl"
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex flex-col items-center gap-6">
                        <motion.div
                            animate={error ? {} : { y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Lock className="w-6 h-6 text-primary/80" />
                        </motion.div>

                        <h2 className="font-serif text-2xl italic text-foreground">Đã khóa</h2>

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div className="relative">
                                <Input
                                    ref={inputRef}
                                    type="password"
                                    placeholder="Nhập mật khẩu tình iu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent border-0 border-b border-border rounded-none text-center text-lg tracking-[0.5em] placeholder:tracking-widest placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary font-serif font-bold"
                                    maxLength={10}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-border hover:border-primary/40 font-serif tracking-wide transition-all duration-300 group"
                            >
                                Mở khóa kỷ niệm
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>
                </motion.div>

                {/* Hint */}
                <AnimatePresence>
                    {showHint && (
                        <motion.p
                            className="text-primary/40 text-sm italic font-serif"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            Gợi ý: Ngày kỉ niệm của chúng ta (ddmmyyyy)
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.p
                    className="text-muted-foreground/30 text-xs tracking-[0.3em] uppercase mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Mãi mãi là của bạn
                </motion.p>
            </motion.div>
        </div>
    );
}

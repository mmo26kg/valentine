"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Timer,
    BookHeart,
    User,
    LogOut,
    Settings,
} from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import { AmbientBackground } from "@/components/shared/ambient-background";

// Lazy load tab components
const HomeTab = dynamic(() => import("@/components/tabs/home-tab").then(m => ({ default: m.HomeTab })), {
    loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-rose-gold font-serif">Đang tải...</div></div>
});
const CountdownTab = dynamic(() => import("@/components/tabs/countdown-tab").then(m => ({ default: m.CountdownTab })), {
    loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-rose-gold font-serif">Đang tải...</div></div>
});
const TimelineTab = dynamic(() => import("@/components/tabs/timeline-tab").then(m => ({ default: m.TimelineTab })), {
    loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-rose-gold font-serif">Đang tải...</div></div>
});
const ProfileTab = dynamic(() => import("@/components/tabs/profile-tab").then(m => ({ default: m.ProfileTab })), {
    loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-rose-gold font-serif">Đang tải...</div></div>
});
const SettingsTab = dynamic(() => import("@/components/tabs/settings-tab").then(m => ({ default: m.SettingsTab })), {
    loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-pulse text-rose-gold font-serif">Đang tải...</div></div>
});
import { NotificationCenter } from "@/components/shared/notification-center";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useValentine } from "@/providers/valentine-provider";

const TABS = [
    { value: "home", label: "Trang chủ", icon: Home },
    { value: "countdown", label: "Đếm ngược", icon: Timer },
    { value: "timeline", label: "Kỷ niệm", icon: BookHeart },
    { value: "profile", label: "Hồ sơ", icon: User },
    // { value: "settings", label: "Cài đặt", icon: Settings },
];

export function MainApp() {
    const [activeTab, setActiveTab] = useState("home");
    const {
        role: currentRole,
        startDate,
        myProfile,
        myCaption,
        partnerCaption,
        hasWrittenToday,
        captions,
        onSubmitCaption,
        posts,
        addPost: onAddPost,
        updatePost: onUpdatePost,
        deletePost: onDeletePost,
        setStartDate: onUpdateStartDate,
        onChangePassword,
        lock: onLock,
        togglePostReaction: onTogglePostReaction,
        partnerName,
        currentUserAvatarURL,
        profiles,
        updateProfile
    } = useValentine();

    const password = myProfile?.password || "19042025";

    return (
        <div className="min-h-screen relative">
            <AmbientBackground />

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="relative z-10"
            >
                {/* Header */}
                <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-surface border border-rose-gold/20 flex items-center justify-center overflow-hidden">
                                <img src="https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/avatar.png" alt="Logo" width={32} height={32} />
                            </div>
                            <span className="font-serif text-lg italic text-white">
                                Ảnh & Ẻm
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationCenter onNavigate={setActiveTab} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-2 text-white/40 text-sm cursor-pointer hover:text-white transition-colors">
                                        <span className="hidden sm:inline font-serif italic">
                                            {currentRole === "ảnh" ? profiles.him?.name : profiles.her?.name}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-surface border border-rose-gold/20 flex items-center justify-center overflow-hidden">
                                            {currentUserAvatarURL ? (
                                                <img src={currentUserAvatarURL} className="w-full h-full object-cover" alt="Avatar" width={32} height={32} />
                                            ) : (
                                                <div className="w-full h-full bg-rose-gold/10 flex items-center justify-center text-rose-gold/30 text-[10px]">
                                                    {currentRole === "ảnh" ? "Anh" : "Em"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#1a1528] border-rose-gold/20 text-white">
                                    <DropdownMenuItem onClick={onLock} className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-6xl mx-auto px-4 py-8 pb-28">
                    <AnimatePresence mode="wait">
                        {activeTab === "home" && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <HomeTab />
                            </motion.div>
                        )}

                        {activeTab === "countdown" && (
                            <motion.div
                                key="countdown"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CountdownTab />
                            </motion.div>
                        )}

                        {activeTab === "timeline" && (
                            <motion.div
                                key="timeline"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TimelineTab />
                            </motion.div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProfileTab />
                            </motion.div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SettingsTab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Bottom Navigation */}
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <Dock magnification={60} distance={100} panelHeight={56}>
                            {TABS.map(({ value, label, icon: Icon }) => (
                                <DockItem
                                    key={value}
                                    active={activeTab === value}
                                    onClick={() => setActiveTab(value)}
                                >
                                    <DockLabel>{label}</DockLabel>
                                    <DockIcon>
                                        <Icon
                                            className={cn(
                                                "size-full transition-colors duration-300",
                                                activeTab === value
                                                    ? "text-rose-gold"
                                                    : "text-white/40 group-hover:text-white"
                                            )}
                                        />
                                    </DockIcon>
                                </DockItem>
                            ))}
                        </Dock>
                    </div>
                </div>
            </Tabs>
        </div >
    );
}

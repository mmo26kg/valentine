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
import { AmbientBackground } from "@/components/shared/ambient-background";
import { HomeTab } from "@/components/tabs/home-tab";
import { CountdownTab } from "@/components/tabs/countdown-tab";
import { TimelineTab } from "@/components/tabs/timeline-tab";
import { ProfileTab } from "@/components/tabs/profile-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";
import { NotificationCenter } from "@/components/shared/notification-center";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useProfiles, useCountdowns, sendNotification } from "@/lib/store";
// import { SAMPLE_USERS } from "@/lib/constants";

const TABS = [
    { value: "home", label: "Trang chủ", icon: Home },
    { value: "countdown", label: "Đếm ngược", icon: Timer },
    { value: "timeline", label: "Kỷ niệm", icon: BookHeart },
    { value: "profile", label: "Hồ sơ", icon: User },
    // { value: "settings", label: "Cài đặt", icon: Settings },
];

interface MainAppProps {
    currentRole: "ảnh" | "ẻm";
    startDate: string;
    password: string;
    myCaption: string;
    partnerCaption: string;
    hasWrittenToday: boolean;
    captions: Record<string, Record<string, { content: string; media_url?: string | null }>>;
    onSubmitCaption: (content: string, mediaUrl?: string | null) => void;
    posts: Array<{
        id: string;
        user_id: string;
        title: string;
        content: string;
        media_url: string | null;
        event_date: string;
        type: "photo" | "video" | "text" | "milestone";
        created_at: string;
        location?: string;
    }>;
    onAddPost: (post: Omit<MainAppProps["posts"][0], "id" | "created_at">) => void;
    onUpdatePost: (id: string, updates: Partial<MainAppProps["posts"][0]>) => void;
    onDeletePost: (id: string, mediaUrls: string[]) => void;
    onUpdateStartDate: (date: string) => void;
    onChangePassword: (pw: string) => void;
    onLock: () => void;
    onTogglePostReaction: (postId: string, userId: string, emoji: string) => void;
}

export function MainApp({
    currentRole,
    startDate,
    password,
    myCaption,
    partnerCaption,
    hasWrittenToday,
    captions,
    onSubmitCaption,
    posts,
    onAddPost,
    onUpdatePost,
    onDeletePost,
    onUpdateStartDate,
    onChangePassword,
    onLock,
    onTogglePostReaction,
}: MainAppProps) {
    const [activeTab, setActiveTab] = useState("home");
    const { profiles, updateProfile } = useProfiles();
    const { countdowns } = useCountdowns();

    // Countdown Reminders Side Effect
    useEffect(() => {
        const checkReminders = async () => {
            const now = new Date();
            for (const event of countdowns) {
                const target = new Date(event.date);
                const diffMs = target.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                // 1 Day Reminder (between 24h and 23h before)
                if (diffHours <= 24 && diffHours > 23) {
                    const key = `reminder-1d-${event.id}-${target.getFullYear()}`;
                    await Promise.all([
                        sendNotification({
                            user_id: "him",
                            title: "Sắp đến ngày quan trọng! 📅",
                            body: `Chỉ còn 1 ngày nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-him`
                        }),
                        sendNotification({
                            user_id: "her",
                            title: "Sắp đến ngày quan trọng! 📅",
                            body: `Chỉ còn 1 ngày nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-her`
                        })
                    ]);
                }

                // 2 Hours Reminder (between 2h and 1h before)
                if (diffHours <= 2 && diffHours > 1) {
                    const key = `reminder-2h-${event.id}-${target.getFullYear()}`;
                    await Promise.all([
                        sendNotification({
                            user_id: "him",
                            title: "Sắp đến giờ rồi! ⏰",
                            body: `Chỉ còn chưa đầy 2 tiếng nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-him`
                        }),
                        sendNotification({
                            user_id: "her",
                            title: "Sắp đến giờ rồi! ⏰",
                            body: `Chỉ còn chưa đầy 2 tiếng nữa là đến: ${event.title}`,
                            type: "reminder",
                            link: "countdown",
                            notification_key: `${key}-her`
                        })
                    ]);
                }
            }
        };

        const interval = setInterval(checkReminders, 1000 * 60 * 60); // Check every hour
        checkReminders();
        return () => clearInterval(interval);
    }, [countdowns]);

    // Resolve dynamic profiles
    const him = { ...profiles["him"] };
    const her = { ...profiles["her"] };

    const partnerName = currentRole === "ảnh" ? her.name : him.name; // Dynamically use name? or stick to static? The requirement said "sửa lại các hình ảnh...". Maybe names too?
    // Let's use dynamic names too for consistency.

    const currentUserAvatarURL = currentRole === "ảnh" ? him.avatar_url : her.avatar_url;

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
                                            {currentRole === "ảnh" ? him.name : her.name}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-surface border border-rose-gold/20 flex items-center justify-center overflow-hidden">
                                            {/* <User className="w-4 h-4 text-rose-gold/60" /> */}
                                            <img src={currentUserAvatarURL || ""} className="w-full h-full object-cover" alt="Avatar" width={32} height={32} />
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
                                <HomeTab
                                    startDate={startDate}
                                    currentRole={currentRole}
                                    partnerName={partnerName}
                                    myCaption={myCaption}
                                    partnerCaption={partnerCaption}
                                    hasWrittenToday={hasWrittenToday}
                                    captions={captions}
                                    onSubmitCaption={onSubmitCaption}
                                />
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
                                <TimelineTab
                                    posts={posts}
                                    currentRole={currentRole}
                                    onAddPost={onAddPost}
                                    onUpdatePost={onUpdatePost}
                                    onDeletePost={onDeletePost}
                                    onTogglePostReaction={onTogglePostReaction}
                                />
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
                                <ProfileTab
                                    currentRole={currentRole}
                                    profiles={profiles}
                                    updateProfile={updateProfile} // No need for casting if types match
                                />
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
                                <SettingsTab
                                    startDate={startDate}
                                    onUpdateStartDate={onUpdateStartDate}
                                    password={password}
                                    onChangePassword={onChangePassword}
                                    onLock={onLock}
                                />
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

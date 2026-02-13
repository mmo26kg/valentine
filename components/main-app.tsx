"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Timer,
    BookHeart,
    User,
    LogOut,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { HomeTab } from "@/components/tabs/home-tab";
import { CountdownTab } from "@/components/tabs/countdown-tab";
import { TimelineTab } from "@/components/tabs/timeline-tab";
import { ProfileTab } from "@/components/tabs/profile-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const TABS = [
    { value: "home", label: "Home", icon: Home },
    { value: "countdown", label: "Countdown", icon: Timer },
    { value: "timeline", label: "Timeline", icon: BookHeart },
    { value: "profile", label: "Profile", icon: User },
    // { value: "settings", label: "Settings", icon: Settings },
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
    onUpdateStartDate: (date: string) => void;
    onChangePassword: (pw: string) => void;
    onLock: () => void;
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
    onUpdateStartDate,
    onChangePassword,
    onLock,
}: MainAppProps) {
    const [activeTab, setActiveTab] = useState("home");
    const partnerName = currentRole === "ảnh" ? "Mĩn Bì" : "Pink Duck";

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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                    <span className="hidden sm:inline font-serif italic">
                                        {currentRole === "ảnh" ? "Pink Duck" : "Mĩn Bì"}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-surface border border-rose-gold/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-rose-gold/60" />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Button variant="link" size="sm" onClick={onLock} className="w-full">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-5xl mx-auto px-4 py-8 pb-28">
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
                                <ProfileTab currentRole={currentRole} />
                            </motion.div>
                        )}

                        {/* Settings Tab (hidden in dock but can be enabled if needed) */}
                        {/* {activeTab === "settings" && (
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
                        )} */}
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
        </div>
    );
}

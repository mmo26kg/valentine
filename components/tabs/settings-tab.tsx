"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Lock,
    Heart,
    Mail,
    LogOut,
    ChevronRight,
    User,
    Pencil,
    Image as ImageIcon,
    Save,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EventManager } from "@/components/events/event-manager";

interface SettingsTabProps {
    startDate: string;
    onUpdateStartDate: (date: string) => void;
    password: string;
    onChangePassword: (newPassword: string) => void;
    onLock: () => void;
}

export function SettingsTab({
    startDate,
    onUpdateStartDate,
    password,
    onChangePassword,
    onLock,
}: SettingsTabProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [notifications, setNotifications] = useState({
        daily: true,
        partner: true,
        anniversary: false,
    });

    const handleSavePassword = () => {
        if (newPassword && newPassword === confirmPassword) {
            onChangePassword(newPassword);
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordChange(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-light text-white">Settings</h1>
                <p className="text-lg text-rose-gold/50 italic font-serif mt-2">
                    Manage your shared space & preferences
                </p>
            </motion.div>

            {/* Profile & Relationship */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-xl font-medium text-rose-gold tracking-wide mb-4 ml-1">
                    Profile & Relationship
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                    {/* Avatars */}
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="flex -space-x-4">
                                    <div className="w-14 h-14 rounded-full bg-surface border-2 border-card flex items-center justify-center overflow-hidden">
                                        <User className="w-6 h-6 text-rose-gold/60" />
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-surface border-2 border-card flex items-center justify-center overflow-hidden">
                                        <User className="w-6 h-6 text-rose-gold-light/60" />
                                    </div>
                                </div>
                                <button className="absolute -bottom-1 -right-2 bg-rose-gold text-background p-1.5 rounded-full shadow-md hover:bg-rose-gold-dark transition-colors">
                                    <Pencil className="w-3 h-3" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">Your Avatars</h3>
                                <p className="text-sm text-white/40">
                                    Update how you appear to each other
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="border-rose-gold/20 text-rose-gold hover:bg-rose-gold/10"
                        >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Manage Photos
                        </Button>
                    </div>

                    {/* Anniversary Date */}
                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-rose-gold/10">
                                <Heart className="w-5 h-5 text-rose-gold" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    Anniversary Date
                                </h3>
                                <p className="text-sm text-white/40">
                                    Used for countdowns & milestones
                                </p>
                            </div>
                        </div>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => onUpdateStartDate(e.target.value)}
                            className="w-40 bg-transparent border-white/10 text-white focus-visible:ring-rose-gold/30 cursor-pointer"
                        />
                    </div>
                </div>
            </motion.section>

            {/* Account Security */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-medium text-rose-gold tracking-wide mb-4 ml-1">
                    Account Security
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                    {/* Email (decorative) */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between hover:bg-surface-hover transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-rose-gold/10">
                                <Mail className="w-5 h-5 text-rose-gold" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    Email Address
                                </h3>
                                <p className="text-sm text-white/40">love@example.com</p>
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/50">
                            Verified
                        </span>
                    </div>

                    {/* Password */}
                    <div
                        className="p-6 hover:bg-surface-hover transition-colors cursor-pointer group"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-rose-gold/10">
                                    <Lock className="w-5 h-5 text-rose-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white group-hover:text-rose-gold transition-colors">
                                        Change Password
                                    </h3>
                                    <p className="text-sm text-white/40">
                                        Current: {password.replace(/./g, "•")}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                className={`w-5 h-5 text-white/20 transition-transform ${showPasswordChange ? "rotate-90" : ""
                                    }`}
                            />
                        </div>

                        {showPasswordChange && (
                            <motion.div
                                className="mt-4 space-y-3 pl-16"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-background border-rose-gold/10 text-white placeholder:text-white/20"
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-background border-rose-gold/10 text-white placeholder:text-white/20"
                                />
                                <Button
                                    onClick={handleSavePassword}
                                    disabled={!newPassword || newPassword !== confirmPassword}
                                    className="bg-rose-gold hover:bg-rose-gold-dark text-background disabled:opacity-30"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Password
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Event Management */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h2 className="text-xl font-medium text-rose-gold tracking-wide mb-4 ml-1">
                    Event Management
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="p-6 flex items-center justify-between hover:bg-surface-hover transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-rose-gold/10">
                                        <Calendar className="w-5 h-5 text-rose-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white group-hover:text-rose-gold transition-colors">
                                            Manage Special Events
                                        </h3>
                                        <p className="text-sm text-white/40">
                                            Add or edit upcoming events & celebrations
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-surface border-rose-gold/10 text-white max-h-[85vh] overflow-y-auto">
                            <EventManager />
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.section>



            {/* Notifications */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-xl font-medium text-rose-gold tracking-wide mb-4 ml-1">
                    Notifications
                </h2>
                <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/5">
                    {[
                        {
                            key: "daily" as const,
                            title: "Daily Reminders",
                            desc: "Receive a daily prompt to connect with your partner.",
                        },
                        {
                            key: "partner" as const,
                            title: "Partner Activity",
                            desc: "Get notified when your partner posts a note or photo.",
                        },
                        {
                            key: "anniversary" as const,
                            title: "Anniversary Alerts",
                            desc: "Reminders 1 week and 1 day before special dates.",
                        },
                    ].map(({ key, title, desc }) => (
                        <div
                            key={key}
                            className="p-6 flex items-center justify-between gap-4 hover:bg-surface-hover transition-colors"
                        >
                            <div className="pr-4">
                                <h3 className="text-lg font-medium text-white">{title}</h3>
                                <p className="text-sm text-white/40 mt-1">{desc}</p>
                            </div>
                            <Switch
                                checked={notifications[key]}
                                onCheckedChange={(v) =>
                                    setNotifications((n) => ({ ...n, [key]: v }))
                                }
                                className="data-[state=checked]:bg-rose-gold"
                            />
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Actions */}
            <motion.div
                className="flex flex-col items-center gap-4 pb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="w-full flex justify-between items-center px-2 mt-4">
                    <span className="text-xs text-white/20">Version 1.0.0</span>
                    <button
                        onClick={onLock}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

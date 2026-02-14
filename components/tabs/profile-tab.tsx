"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Plus,
    Sparkles,
    Upload,
    Check,
    X,
    Clock
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
// import { SAMPLE_USERS } from "@/lib/constants";
import { useLove, useProfiles } from "@/lib/store";
import { Profile } from "@/lib/types";
import { FallingHearts } from "../shared/falling-hearts";

interface ProfileTabProps {
    currentRole: "ảnh" | "ẻm";
    profiles: Record<string, Profile>;
    updateProfile: (profile: Profile) => Promise<boolean>;
}

// Helper to merge DB profile with default
const mergeProfile = (roleId: "him" | "her", dbProfile?: Profile): Profile => {
    const defaultUser = {
        id: roleId,
        name: roleId === "him" ? "Anh" : "Em",
        avatar_url: roleId === "him" ? "/images/default-avatar-him.png" : "/images/default-avatar-her.png",
        tagline: "Đang cảm thấy được yêu & hạnh phúc",
        bio: "",
        personality_tags: [],
        likes: [],
        dislikes: []
    };
    // Map defaultUser (which has different shape) to Profile
    const defaultProfile: Profile = {
        id: roleId,
        name: defaultUser.name,
        avatar_url: defaultUser.avatar_url,
        tagline: defaultUser.tagline,
        bio: defaultUser.bio,
        personality_tags: defaultUser.personality_tags,
        likes: defaultUser.likes,
        dislikes: defaultUser.dislikes
    };

    if (!dbProfile) return defaultProfile;

    return {
        ...defaultProfile,
        ...dbProfile,
        name: dbProfile.name || defaultProfile.name,
        avatar_url: dbProfile.avatar_url || defaultProfile.avatar_url,
        tagline: dbProfile.tagline || defaultProfile.tagline,
        bio: dbProfile.bio || defaultProfile.bio,
        personality_tags: dbProfile.personality_tags || defaultProfile.personality_tags,
        likes: dbProfile.likes || defaultProfile.likes,
        dislikes: dbProfile.dislikes || defaultProfile.dislikes,
    };
};

function ProfileCard({
    roleId,
    user,
    isOwner,
    onSave,
    loveProps
}: {
    roleId: "him" | "her";
    user: Profile;
    isOwner: boolean;
    onSave: (profile: Profile) => Promise<boolean | void>;
    loveProps: {
        sendLove: () => Promise<boolean>;
        loveCount: number;
        cooldownRemaining: number;
    };
}) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || "");
    const [name, setName] = useState(user.name || "");
    const [tagline, setTagline] = useState(user.tagline || "");

    // Tag management
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState<string[]>(user.personality_tags || []);

    // Likes/Dislikes management
    const [newLike, setNewLike] = useState("");
    const [likes, setLikes] = useState<string[]>(user.likes || []);

    const [newDislike, setNewDislike] = useState("");
    const [dislikes, setDislikes] = useState<string[]>(user.dislikes || []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleAddLike = () => {
        if (newLike.trim() && !likes.includes(newLike.trim())) {
            setLikes([...likes, newLike.trim()]);
            setNewLike("");
        }
    };
    const handleRemoveLike = (itemToRemove: string) => {
        setLikes(likes.filter(i => i !== itemToRemove));
    };

    const handleAddDislike = () => {
        if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
            setDislikes([...dislikes, newDislike.trim()]);
            setNewDislike("");
        }
    };
    const handleRemoveDislike = (itemToRemove: string) => {
        setDislikes(dislikes.filter(i => i !== itemToRemove));
    };

    const handleSave = async () => {
        const success = await onSave({
            ...user,
            name,
            tagline,
            bio,
            personality_tags: tags,
            likes,
            dislikes
        });
        if (success !== false) {
            setEditing(false);
        }
    };

    const handleAvatarClick = () => {
        if (isOwner && editing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            const publicUrl = data.publicUrl;

            // Immediately save new avatar
            await onSave({
                ...user,
                avatar_url: publicUrl
            });
            // toast.success("Avatar updated!");
        } catch (err) {
            console.error(err);
            alert("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    // Format cooldown
    const formatCooldown = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <motion.div
            className="glass-card rounded-2xl overflow-hidden flex flex-col h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Cover Image */}
            <div className="relative h-32 overflow-hidden shrink-0">
                <Image
                    src={
                        roleId === "him"
                            ? "https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/ky-hieu-cung-cu-giai.png"
                            : "https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/Hinh-anh-bieu-tuong-cung-kim-nguu-1.jpg"
                    }
                    alt="Cover"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1a1528] to-transparent" />

                {/* Edit button */}
                {isOwner && (
                    <button
                        onClick={() => {
                            if (editing) handleSave();
                            else setEditing(true);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/60 hover:text-rose-gold transition-colors z-10"
                    >
                        {editing ? <Check className="w-4 h-4 text-green-400" /> : <Pencil className="w-4 h-4" />}
                    </button>
                )}
                {isOwner && editing && (
                    <button
                        onClick={() => setEditing(false)}
                        className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/60 hover:text-red-400 transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-12 px-6 pb-8 relative z-0 grow">
                <div className="relative group">
                    <div
                        className={`w-24 h-24 rounded-full bg-[#1a1528] border-4 border-[#1a1528] flex items-center justify-center overflow-hidden cursor-pointer ${isOwner && editing ? "hover:opacity-80 transition-opacity" : ""}`}
                        onClick={handleAvatarClick}
                    >
                        <img
                            src={user.avatar_url || ""}
                            alt="Avatar"
                            className={`w-full h-full object-cover ${isUploading ? "opacity-50" : ""}`}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="loading loading-spinner loading-xs text-white">...</span>
                            </div>
                        )}
                        {isOwner && editing && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>
                    {isOwner && !editing && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-[#1a1528]" />
                    )}
                </div>

                <div className="mt-4 text-center w-full">
                    {editing ? (
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center font-serif text-xl border-rose-gold/20 bg-transparent text-white focus-visible:ring-rose-gold/50"
                        />
                    ) : (
                        <h2 className="text-2xl font-serif text-white">{user.name}</h2>
                    )}

                    <div className="mt-1 flex justify-center">
                        {editing ? (
                            <Textarea
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="bg-white/5 border-rose-gold/10 text-white text-sm min-h-[40px] font-serif focus-visible:ring-rose-gold/50"
                            />
                        ) : (
                            <p className="text-rose-gold/50 italic font-serif text-sm">
                                &ldquo;{user.tagline || "Đang cảm thấy được yêu & hạnh phúc"}&rdquo;
                            </p>
                        )}
                    </div>
                </div>

                {/* About */}
                <div className="w-full mt-6">
                    <h3 className="text-xs uppercase tracking-widest text-rose-gold/60 mb-3">
                        Giới thiệu
                    </h3>
                    <div className="border-t border-rose-gold/10 pt-3">
                        {editing ? (
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-white/5 border-rose-gold/10 text-white text-sm min-h-[80px] font-serif focus-visible:ring-rose-gold/50"
                            />
                        ) : (
                            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>
                        )}
                    </div>
                </div>

                {/* Personality Tags */}
                <div className="w-full mt-6">
                    <h3 className="text-xs uppercase tracking-widest text-rose-gold/60 mb-3">
                        Tính cách
                    </h3>
                    <div className="border-t border-rose-gold/10 pt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="border-rose-gold/20 text-rose-gold/80 bg-rose-gold/5 rounded-full px-3 py-1 text-xs flex gap-1 items-center"
                            >
                                {tag}
                                {editing && (
                                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-400">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </Badge>
                        ))}
                        {editing && (
                            <div className="flex gap-1">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                    placeholder="Thêm..."
                                    className="h-7 w-20 text-xs bg-transparent border-rose-gold/20 text-white px-2 focus-visible:ring-rose-gold/50"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleAddTag}
                                    className="h-7 w-7 p-0 text-rose-gold hover:bg-rose-gold/10"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Likes & Dislikes */}
                <div className="w-full mt-6 grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-lg p-4 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-rose-gold/60 mb-3">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="uppercase tracking-widest">Sở thích</span>
                        </div>
                        <div className="space-y-1.5 grow">
                            {(likes || []).map((like) => (
                                <div key={like} className="flex justify-between items-start group/item">
                                    <p className="text-white/50 text-sm italic font-serif">
                                        {like}
                                    </p>
                                    {editing && (
                                        <button onClick={() => handleRemoveLike(like)} className="text-white/20 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {editing && (
                                <div className="flex gap-1 mt-2">
                                    <Input
                                        value={newLike}
                                        onChange={(e) => setNewLike(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddLike()}
                                        placeholder="Thêm..."
                                        className="h-7 text-xs bg-transparent border-rose-gold/20 text-white px-2 focus-visible:ring-rose-gold/50 min-w-0"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleAddLike}
                                        className="h-7 w-7 p-0 text-rose-gold hover:bg-rose-gold/10 shrink-0"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="glass-card rounded-lg p-4 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-rose-gold/60 mb-3">
                            <ThumbsDown className="w-3 h-3" />
                            <span className="uppercase tracking-widest">Ghét</span>
                        </div>
                        <div className="space-y-1.5 grow">
                            {(dislikes || []).map((dislike) => (
                                <div key={dislike} className="flex justify-between items-start group/item">
                                    <p className="text-white/50 text-sm italic font-serif">
                                        {dislike}
                                    </p>
                                    {editing && (
                                        <button onClick={() => handleRemoveDislike(dislike)} className="text-white/20 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {editing && (
                                <div className="flex gap-1 mt-2">
                                    <Input
                                        value={newDislike}
                                        onChange={(e) => setNewDislike(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddDislike()}
                                        placeholder="Thêm..."
                                        className="h-7 text-xs bg-transparent border-rose-gold/20 text-white px-2 focus-visible:ring-rose-gold/50 min-w-0"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleAddDislike}
                                        className="h-7 w-7 p-0 text-rose-gold hover:bg-rose-gold/10 shrink-0"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 w-full">
                    {isOwner ? (
                        <div className="glass-card p-4 rounded-xl border border-rose-gold/10 bg-rose-gold/5">
                            <div className="flex items-center justify-between text-rose-gold">
                                <span className="text-sm font-medium">Đã nhận được</span>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-rose-gold" />
                                    <span className="text-xl font-bold">{loveProps.loveCount}</span>
                                </div>
                            </div>
                            <p className="text-xs text-white/40 mt-1 text-right">lượt yêu hôm nay</p>
                        </div>
                    ) : (
                        <Button
                            className={`w-full gap-2 relative overflow-hidden transition-all ${loveProps.cooldownRemaining > 0
                                ? 'bg-white/5 text-white/40 border-white/10 hover:bg-white/5 cursor-not-allowed'
                                : 'bg-rose-gold/10 hover:bg-rose-gold/20 text-rose-gold border border-rose-gold/20 hover:border-rose-gold/50'
                                }`}
                            onClick={async () => {
                                if (loveProps.cooldownRemaining === 0) {
                                    const sent = await loveProps.sendLove();
                                    if (sent) {
                                        // toast.success("Đã gửi chút tình iu! 💖");
                                    }
                                }
                            }}
                            disabled={loveProps.cooldownRemaining > 0}
                        >
                            {loveProps.cooldownRemaining > 0 ? (
                                <>
                                    <Clock className="w-4 h-4 animate-pulse" />
                                    <span>{formatCooldown(loveProps.cooldownRemaining)}</span>
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4 fill-current" />
                                    <span>Gửi chút tình yêu</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}


export function ProfileTab({ currentRole, profiles, updateProfile }: ProfileTabProps) {
    // const { profiles, updateProfile } = useProfiles(); // Removed internal hook usage
    console.log("Current profiles state:", profiles);
    const { sendLove, loveCount, cooldownRemaining } = useLove(currentRole);

    const himProfile = mergeProfile("him", profiles["him"]);
    const herProfile = mergeProfile("her", profiles["her"]);

    const [showHearts, setShowHearts] = useState(false);

    // Wrapper for sendLove to trigger animation
    const handleSendLove = async () => {
        const sent = await sendLove();
        if (sent) {
            // toast.success("Đã gửi chút tình iu! 💖");
            setShowHearts(true);
            setTimeout(() => setShowHearts(false), 5000);
        }
        return sent;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 relative">
            <AnimatePresence>
                {showHearts && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-50"
                    >
                        <FallingHearts count={30} minDelay={0} maxDelay={2} minDuration={3} maxDuration={5} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileCard
                roleId="him"
                user={himProfile}
                isOwner={currentRole === "ảnh"}
                onSave={updateProfile}
                loveProps={{
                    sendLove: handleSendLove,
                    loveCount,
                    cooldownRemaining
                }}
            />
            <ProfileCard
                roleId="her"
                user={herProfile}
                isOwner={currentRole === "ẻm"}
                onSave={updateProfile}
                loveProps={{
                    sendLove: handleSendLove,
                    loveCount,
                    cooldownRemaining
                }}
            />
        </div>
    );
}

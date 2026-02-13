"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Pencil,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Plus,
    User,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SAMPLE_USERS } from "@/lib/constants";

interface ProfileTabProps {
    currentRole: "ảnh" | "ẻm";
}

function ProfileCard({
    user,
    isOwner,
}: {
    user: (typeof SAMPLE_USERS)["him"] | (typeof SAMPLE_USERS)["her"];
    isOwner: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || "");
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState(user.personality_tags || []);

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
        }
    };

    return (
        <motion.div
            className="glass-card rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Cover Image */}
            <div className="relative h-32 overflow-hidden">
                <Image
                    src={
                        user.role === "him"
                            ? "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600"
                            : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"
                    }
                    alt="Cover"
                    fill
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

                {/* Edit button */}
                {isOwner && (
                    <button
                        onClick={() => setEditing(!editing)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 backdrop-blur flex items-center justify-center text-white/60 hover:text-rose-gold transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-12 px-6 pb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-surface border-4 border-card flex items-center justify-center overflow-hidden">
                        <User className="w-10 h-10 text-rose-gold/60" />
                    </div>
                    {isOwner && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-card" />
                    )}
                </div>

                <h2 className="text-2xl font-serif mt-4 text-white">{user.name}</h2>
                <p className="text-rose-gold/50 italic font-serif text-sm mt-1">
                    &ldquo;Đang cảm thấy được yêu & hạnh phúc&rdquo;
                </p>

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
                                className="bg-background/30 border-rose-gold/10 text-white text-sm min-h-[80px] font-serif"
                            />
                        ) : (
                            <p className="text-white/60 text-sm leading-relaxed">{bio}</p>
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
                                className="border-rose-gold/20 text-rose-gold/80 bg-rose-gold/5 rounded-full px-3 py-1 text-xs"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {isOwner && editing && (
                            <div className="flex gap-1">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                                    placeholder="Thêm tag..."
                                    className="h-7 w-24 text-xs bg-transparent border-rose-gold/20 text-white"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={addTag}
                                    className="h-7 px-2 text-rose-gold"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Likes & Dislikes */}
                <div className="w-full mt-6 grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-lg p-4">
                        <div className="flex items-center gap-2 text-xs text-rose-gold/60 mb-3">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="uppercase tracking-widest">Sở thích</span>
                        </div>
                        <div className="space-y-1.5">
                            {(user.likes || []).map((like) => (
                                <p key={like} className="text-white/50 text-sm italic font-serif">
                                    {like}
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="glass-card rounded-lg p-4">
                        <div className="flex items-center gap-2 text-xs text-rose-gold/60 mb-3">
                            <ThumbsDown className="w-3 h-3" />
                            <span className="uppercase tracking-widest">Ghét</span>
                        </div>
                        <div className="space-y-1.5">
                            {(user.dislikes || []).map((dislike) => (
                                <p key={dislike} className="text-white/50 text-sm italic font-serif">
                                    {dislike}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <button className="mt-6 flex items-center gap-2 text-white/30 hover:text-rose-gold transition-colors text-sm">
                    {isOwner ? (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Cài đặt hồ sơ
                        </>
                    ) : (
                        <>
                            <Heart className="w-4 h-4" fill="currentColor" />
                            Gửi chút tình yêu
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}

export function ProfileTab({ currentRole }: ProfileTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProfileCard
                user={SAMPLE_USERS.him}
                isOwner={currentRole === "ảnh"}
            />
            <ProfileCard
                user={SAMPLE_USERS.her}
                isOwner={currentRole === "ẻm"}
            />
        </div>
    );
}

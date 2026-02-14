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
import { useLove, useLoveStats } from "@/lib/store";
import { useValentine } from "@/providers/valentine-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Profile } from "@/lib/types";
import { FallingHearts } from "../shared/falling-hearts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Helper to merge DB profile with default
const mergeProfile = (roleId: "him" | "her", dbProfile?: Profile): Profile => {
    const defaultProfile: Profile = {
        id: roleId,
        name: roleId === "him" ? "Anh" : "Em",
        avatar_url: roleId === "him" ? "/images/default-avatar-him.png" : "/images/default-avatar-her.png",
        tagline: "Đang cảm thấy được yêu & hạnh phúc",
        bio: "",
        personality_tags: [],
        likes: [],
        dislikes: []
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

function ItemList({
    title, icon, items, editing,
    newItemValue, onNewItemChange, onAdd, onRemove
}: {
    title: string;
    icon: React.ReactNode;
    items: string[];
    editing: boolean;
    newItemValue: string;
    onNewItemChange: (value: string) => void;
    onAdd: () => void;
    onRemove: (item: string) => void;
}) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const MAX_VISIBLE = isMobile ? 4 : 8;
    const visibleItems = editing ? items : items.slice(0, MAX_VISIBLE);
    const hiddenCount = items.length - MAX_VISIBLE;
    const showMore = !editing && hiddenCount > 0;

    return (
        <div className="glass-card rounded-lg p-4 flex flex-col h-full border border-border bg-card/80">
            <div className="flex items-center gap-2 text-xs text-primary/60 mb-3">
                {icon}
                <span className="uppercase tracking-widest">{title}</span>
            </div>

            <div className="flex flex-wrap gap-2 content-start grow">
                {visibleItems.map((item, idx) => (
                    <div key={`${item}-${idx}`} className="flex justify-between items-center group/item bg-muted hover:bg-muted/80 transition-colors rounded-full px-3 py-1 min-h-[24px]">
                        <p className="text-foreground/70 text-xs leading-tight wrap-break-word pr-1 lowercase font-sans">
                            # {item}
                        </p>
                        {editing && (
                            <button onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity ml-1 shrink-0">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}

                {showMore && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="flex items-center justify-center bg-muted rounded px-2 py-1.5 text-xs text-primary/60 hover:text-primary hover:bg-muted/80 transition-colors w-full border border-dashed border-primary/20 h-[32px]">
                                <Plus className="w-3 h-3 mr-1" /> Xem thêm {hiddenCount} mục
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-popover border-border text-popover-foreground max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-primary font-serif text-xl">
                                    {icon} {title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item, idx) => (
                                    <div key={`${item}-${idx}`} className="bg-muted rounded px-3 py-2 text-sm text-foreground/90 font-serif border border-border">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {editing && (
                <div className="flex gap-1 mt-3 pt-3 border-t border-border w-full">
                    <Input
                        value={newItemValue}
                        onChange={(e) => onNewItemChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onAdd()}
                        placeholder="Thêm..."
                        className="h-8 text-xs bg-transparent border-primary/20 text-foreground px-2 focus-visible:ring-primary/50 min-w-0"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onAdd}
                        className="h-8 w-8 p-0 text-primary hover:bg-primary/10 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

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
        totalLove: number;
    };
}) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || "");
    const [name, setName] = useState(user.name || "");
    const [tagline, setTagline] = useState(user.tagline || "");

    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState<string[]>(user.personality_tags || []);

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

            await onSave({
                ...user,
                avatar_url: publicUrl
            });
        } catch (err) {
            console.error(err);
            toast.error("Tải ảnh đại diện thất bại");
        } finally {
            setIsUploading(false);
        }
    };

    const formatCooldown = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <motion.div
            className="glass-card rounded-2xl overflow-hidden flex flex-col h-full border border-border bg-card/80"
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
                <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />

                {isOwner && (
                    <button
                        onClick={() => {
                            if (editing) handleSave();
                            else setEditing(true);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/30 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-primary transition-colors z-10"
                    >
                        {editing ? <Check className="w-4 h-4 text-green-400" /> : <Pencil className="w-4 h-4" />}
                    </button>
                )}
                {isOwner && editing && (
                    <button
                        onClick={() => setEditing(false)}
                        className="absolute top-3 right-12 w-8 h-8 rounded-full bg-background/30 backdrop-blur flex items-center justify-center text-foreground/60 hover:text-destructive transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center -mt-12 px-6 pb-8 relative z-0 grow">
                <div className="relative group">
                    <div
                        className={`w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center overflow-hidden cursor-pointer ${isOwner && editing ? "hover:opacity-80 transition-opacity" : ""}`}
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
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
                    )}
                </div>

                <div className="mt-4 text-center w-full">
                    {editing ? (
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center font-serif text-xl border-primary/20 bg-transparent text-foreground focus-visible:ring-primary/50"
                        />
                    ) : (
                        <h2 className="text-2xl font-serif text-foreground">{user.name}</h2>
                    )}

                    <div className="mt-1 flex justify-center">
                        {editing ? (
                            <Textarea
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="bg-muted border-primary/10 text-foreground text-sm min-h-[40px] font-serif focus-visible:ring-primary/50"
                            />
                        ) : (
                            <p className="text-primary/50 italic font-serif text-sm">
                                &ldquo;{user.tagline || "Đang cảm thấy được yêu & hạnh phúc"}&rdquo;
                            </p>
                        )}
                    </div>
                </div>

                <div className="w-full mt-6">
                    <h3 className="text-xs uppercase tracking-widest text-primary/60 mb-3">
                        Giới thiệu
                    </h3>
                    <div className="border-t border-primary/10 pt-3">
                        {editing ? (
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-muted border-primary/10 text-foreground text-sm min-h-[80px] font-serif focus-visible:ring-primary/50"
                            />
                        ) : (
                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{bio}</p>
                        )}
                    </div>
                </div>

                <div className="w-full mt-6">
                    <h3 className="text-xs uppercase tracking-widest text-primary/60 mb-3">
                        Tính cách
                    </h3>
                    <div className="border-t border-primary/10 pt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="border-primary/20 text-primary/80 bg-primary/5 rounded-full px-3 py-1 text-xs flex gap-1 items-center"
                            >
                                {tag}
                                {editing && (
                                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
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
                                    className="h-7 w-20 text-xs bg-transparent border-primary/20 text-foreground px-2 focus-visible:ring-primary/50"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleAddTag}
                                    className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ItemList
                        title="Sở thích"
                        icon={<ThumbsUp className="w-3 h-3" />}
                        items={likes || []}
                        editing={editing}
                        newItemValue={newLike}
                        onNewItemChange={setNewLike}
                        onAdd={handleAddLike}
                        onRemove={handleRemoveLike}
                    />
                    <ItemList
                        title="Ghét"
                        icon={<ThumbsDown className="w-3 h-3" />}
                        items={dislikes || []}
                        editing={editing}
                        newItemValue={newDislike}
                        onNewItemChange={setNewDislike}
                        onAdd={handleAddDislike}
                        onRemove={handleRemoveDislike}
                    />
                </div>

                <div className="mt-auto pt-6 w-full">
                    {isOwner ? (
                        <div className="glass-card p-4 rounded-xl border border-primary/10 bg-primary/5">
                            <div className="flex items-center justify-between text-primary">
                                <span className="text-sm font-medium">Đã nhận được</span>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 fill-primary" />
                                    <span className="text-xl font-bold">{loveProps.loveCount}</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-right">lượt yêu hôm nay</p>

                            <div className="flex items-center justify-between text-primary/70 mt-3 pt-3 border-t border-primary/10">
                                <span className="text-sm font-medium">Tổng lịch sử</span>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-lg font-bold">{loveProps.totalLove}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Button
                                className={`w-full gap-2 relative overflow-hidden transition-all ${loveProps.cooldownRemaining > 0
                                    ? 'bg-muted text-muted-foreground border-border hover:bg-muted cursor-not-allowed'
                                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50'
                                    }`}
                                onClick={async () => {
                                    if (loveProps.cooldownRemaining === 0) {
                                        const sent = await loveProps.sendLove();
                                        if (sent) {
                                            toast.success("Đã gửi chút tình iu! 💖");
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

                            <div className="flex items-center justify-between text-muted-foreground mt-3 px-1">
                                <span className="text-xs">Tổng số tim đã nhận</span>
                                <div className="flex items-center gap-1.5">
                                    <Heart className="w-3 h-3" />
                                    <span className="text-sm font-medium">{loveProps.totalLove}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function ProfileTab() {
    const { role: currentRole, profiles, updateProfile } = useValentine();
    const { sendLove, loveCount, cooldownRemaining } = useLove(currentRole);
    const apiStats = useLoveStats();
    const stats = apiStats || { him: 0, her: 0 };

    const himProfile = mergeProfile("him", profiles["him"]);
    const herProfile = mergeProfile("her", profiles["her"]);

    const [showHearts, setShowHearts] = useState(false);

    const handleSendLove = async () => {
        const sent = await sendLove();
        if (sent) {
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
                    cooldownRemaining,
                    totalLove: stats.him
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
                    cooldownRemaining,
                    totalLove: stats.her
                }}
            />
        </div>
    );
}

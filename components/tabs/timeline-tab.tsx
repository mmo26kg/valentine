"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    MapPin,
    Heart,
    Pencil,
    Quote,
    X,
    Camera,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface TimelinePost {
    id: string;
    user_id: string;
    title: string;
    content: string;
    media_url: string | null;
    event_date: string;
    type: "photo" | "video" | "text" | "milestone";
    created_at: string;
    location?: string;
}

interface TimelineTabProps {
    posts: TimelinePost[];
    currentRole: "ảnh" | "ẻm";
    onAddPost: (post: Omit<TimelinePost, "id" | "created_at">) => void;
}



export function TimelineTab({ posts, currentRole, onAddPost }: TimelineTabProps) {
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        media_url: "",
        event_date: format(new Date(), "yyyy-MM-dd"),
        type: "text" as const,
        location: "",
    });

    // Get unique years
    const years = useMemo(() => {
        const yearSet = new Set(posts.map((p) => p.event_date.substring(0, 4)));
        return Array.from(yearSet).sort().reverse();
    }, [posts]);

    // Filter posts
    const filtered = useMemo(() => {
        let result = [...posts];
        if (filterYear) result = result.filter((p) => p.event_date.startsWith(filterYear));
        return result.sort(
            (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        );
    }, [posts, filterYear]);

    // Group by year for timeline markers
    const grouped = useMemo(() => {
        const map: Record<string, TimelinePost[]> = {};
        filtered.forEach((p) => {
            const year = p.event_date.substring(0, 4);
            if (!map[year]) map[year] = [];
            map[year].push(p);
        });
        return map;
    }, [filtered]);

    const handleSubmit = () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        onAddPost({
            ...newPost,
            user_id: currentRole,
            media_url: newPost.media_url || null,
        });
        setNewPost({
            title: "",
            content: "",
            media_url: "",
            event_date: format(new Date(), "yyyy-MM-dd"),
            type: "text",
            location: "",
        });
        setAddOpen(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <p className="text-rose-gold/50 text-sm uppercase tracking-widest">
                        Timeline
                    </p>
                    <h1 className="text-4xl font-serif italic text-white">Our Journey</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {years.map((y) => (
                        <button
                            key={y}
                            onClick={() => setFilterYear(filterYear === y ? null : y)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterYear === y
                                ? "bg-rose-gold text-background"
                                : "bg-surface hover:bg-surface-hover text-white/60 border border-rose-gold/10"
                                }`}
                        >
                            {y}
                        </button>
                    ))}
                    {filterYear && (
                        <button
                            onClick={() => setFilterYear(null)}
                            className="text-rose-gold/60 hover:text-rose-gold text-sm flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
                {/* Center line */}
                <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-[2px] bg-rose-gold/10 hidden md:block" />

                {Object.entries(grouped).map(([year, yearPosts]) => (
                    <div key={year}>
                        {/* Year Marker */}
                        <motion.div
                            className="flex justify-center mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="px-6 py-2 rounded-full border border-rose-gold/20 bg-surface text-rose-gold font-serif text-lg">
                                {year}
                            </div>
                        </motion.div>

                        {/* Posts */}
                        {yearPosts.map((post, i) => {
                            const isLeft = i % 2 === 0;
                            const d = new Date(post.event_date);

                            return (
                                <motion.div
                                    key={post.id}
                                    className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 mb-12 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {/* Date side */}
                                    <div
                                        className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"
                                            }`}
                                    >
                                        <h3 className="text-2xl font-serif italic text-white">
                                            {format(d, "MMMM do")}
                                        </h3>
                                        <p className="text-xs uppercase tracking-widest text-rose-gold/50 mt-1">
                                            {post.title}
                                        </p>
                                        {post.location && (
                                            <div className={`flex items-center gap-1 mt-2 text-sm text-white/30 ${isLeft ? "md:justify-end" : ""}`}>
                                                <MapPin className="w-3 h-3 text-rose-gold/40" />
                                                {post.location}
                                            </div>
                                        )}
                                    </div>

                                    {/* Center dot */}
                                    <div className="hidden md:flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full border-2 border-rose-gold/30 bg-background z-10" />
                                    </div>

                                    {/* Content side */}
                                    <div className="flex-1">
                                        <div className="glass-card glass-card-hover rounded-xl overflow-hidden">
                                            {post.media_url && (
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={post.media_url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
                                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-rose-gold">
                                                        <Heart className="w-3 h-3" fill="currentColor" />
                                                        <span>{Math.floor(Math.random() * 40 + 5)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-5">
                                                {!post.media_url && (
                                                    <Quote className="w-6 h-6 text-rose-gold/20 mb-2" />
                                                )}
                                                <p className="text-white/60 font-serif italic leading-relaxed text-sm">
                                                    {post.content}
                                                </p>
                                                <div className="flex items-center gap-3 mt-4 text-xs text-white/20">
                                                    <button className="flex items-center gap-1 hover:text-rose-gold transition-colors">
                                                        <Heart className="w-3 h-3" /> Like
                                                    </button>
                                                    {post.user_id === currentRole && (
                                                        <button className="flex items-center gap-1 hover:text-rose-gold transition-colors">
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Add Memory FAB */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                    <motion.button
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-rose-gold text-background shadow-lg shadow-rose-gold/20 flex items-center justify-center z-40 hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Plus className="w-7 h-7" />
                    </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-rose-gold/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif italic text-center text-white">
                            Add a Memory
                        </DialogTitle>
                        <p className="text-center text-rose-gold/50 font-serif text-sm">
                            Capture this moment in time forever
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Upload area */}
                        <div className="border-2 border-dashed border-rose-gold/20 rounded-xl p-8 text-center hover:border-rose-gold/40 transition-colors cursor-pointer">
                            <Camera className="w-8 h-8 text-rose-gold/40 mx-auto mb-2" />
                            <p className="text-sm">
                                <span className="text-rose-gold">Upload a file</span>
                                <span className="text-white/40"> or drag and drop</span>
                            </p>
                            <p className="text-xs text-white/20 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>

                        <div>
                            <Label className="text-white/60">Title</Label>
                            <Input
                                value={newPost.title}
                                onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                                placeholder="What happened?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60">Date</Label>
                            <Input
                                type="date"
                                value={newPost.event_date}
                                onChange={(e) => setNewPost((p) => ({ ...p, event_date: e.target.value }))}
                                className="bg-background border-rose-gold/10 text-white focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60">Share your thoughts</Label>
                            <Textarea
                                value={newPost.content}
                                onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                                placeholder="What made this moment special?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 min-h-[100px] focus-visible:ring-rose-gold/30 font-serif"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60">Location (optional)</Label>
                            <Input
                                value={newPost.location}
                                onChange={(e) => setNewPost((p) => ({ ...p, location: e.target.value }))}
                                placeholder="Where was this?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={!newPost.title.trim() || !newPost.content.trim()}
                            className="w-full bg-rose-gold hover:bg-rose-gold-dark text-background font-serif py-5 disabled:opacity-30"
                        >
                            Post to Timeline
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

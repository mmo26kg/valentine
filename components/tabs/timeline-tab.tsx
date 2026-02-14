"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    MapPin,
    Heart,
    Pencil,
    Quote,
    X,
    Camera,
    Trash2,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
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
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useUpload } from "@/hooks/use-upload";
import { getVietnamDate, formatVietnamDate } from "@/lib/date-utils";

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
    media_urls?: string[];
}

interface TimelineTabProps {
    posts: TimelinePost[];
    currentRole: "ảnh" | "ẻm";
    onAddPost: (post: Omit<TimelinePost, "id" | "created_at">) => void;
    onDeletePost?: (id: string, mediaUrls: string[]) => void;
    onUpdatePost?: (id: string, updates: Partial<TimelinePost>) => void;
}

export function TimelineTab({ posts, currentRole, onAddPost, onDeletePost, onUpdatePost }: TimelineTabProps) {
    const { uploadFile, isUploading: uploading } = useUpload();
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);

    // Gallery State
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<TimelinePost | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [newPost, setNewPost] = useState<{
        title: string;
        content: string;
        event_date: string;
        type: "photo" | "video" | "text" | "milestone";
        location: string;
        media_urls: string[];
    }>({
        title: "",
        content: "",
        event_date: formatVietnamDate(undefined, "yyyy-MM-dd"),
        type: "text",
        location: "",
        media_urls: [],
    });

    // Handle Delete
    const handleDelete = (post: TimelinePost) => {
        if (confirm("Bạn có chắc muốn xóa kỷ niệm này không? Hành động này không thể hoàn tác.")) {
            const urlsToDelete = post.media_urls || (post.media_url ? [post.media_url] : []);
            onDeletePost?.(post.id, urlsToDelete);
        }
    };

    const openGallery = (post: TimelinePost, index: number = 0) => {
        setSelectedPost(post);
        setCurrentImageIndex(index);
        setGalleryOpen(true);
    };

    const nextImage = () => {
        if (!selectedPost) return;
        const total = (selectedPost.media_urls?.length || (selectedPost.media_url ? 1 : 0));
        setCurrentImageIndex((prev) => (prev + 1) % total);
    };

    const prevImage = () => {
        if (!selectedPost) return;
        const total = (selectedPost.media_urls?.length || (selectedPost.media_url ? 1 : 0));
        setCurrentImageIndex((prev) => (prev - 1 + total) % total);
    };

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
            (a, b) => getVietnamDate(b.event_date).getTime() - getVietnamDate(a.event_date).getTime()
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

        if (editingPostId) {
            onUpdatePost?.(editingPostId, {
                title: newPost.title,
                content: newPost.content,
                event_date: newPost.event_date,
                type: newPost.type,
                location: newPost.location,
                media_urls: newPost.media_urls,
                media_url: newPost.media_urls[0] || null,
            });
        } else {
            onAddPost({
                ...newPost,
                user_id: currentRole,
                media_url: newPost.media_urls[0] || null, // Backwards compatibility
                media_urls: newPost.media_urls,
            });
        }

        handleCloseDialog();
    };

    const handleCloseDialog = () => {
        setNewPost({
            title: "",
            content: "",
            media_urls: [],
            event_date: formatVietnamDate(undefined, "yyyy-MM-dd"),
            type: "text",
            location: "",
        });
        setEditingPostId(null);
        setAddOpen(false);
    }

    const handleEdit = (post: TimelinePost) => {
        setNewPost({
            title: post.title,
            content: post.content,
            event_date: post.event_date,
            type: post.type,
            location: post.location || "",
            media_urls: post.media_urls || (post.media_url ? [post.media_url] : []),
        });
        setEditingPostId(post.id);
        setAddOpen(true);
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
                        Dòng thời gian
                    </p>
                    <h1 className="text-4xl font-serif italic text-white">Hành trình yêu</h1>
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
                            Xóa lọc
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
                {/* Center line */}
                <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-[2px] bg-rose-gold/10 hidden md:block" />

                {years.map((year) => {
                    const yearPosts = grouped[year];
                    if (!yearPosts) return null;

                    return (
                        <div key={year}>
                            {/* Year Marker */}
                            <motion.div
                                className="flex justify-center mb-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="px-6 py-2 z-10 rounded-full border border-rose-gold/20 bg-surface text-rose-gold font-serif text-lg">
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
                                                {format(d, "d MMMM")}
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
                                                {(post.media_urls && post.media_urls.length > 0) ? (
                                                    <div
                                                        className="relative aspect-video overflow-hidden cursor-pointer group"
                                                        onClick={() => openGallery(post, 0)}
                                                    >
                                                        <Image
                                                            src={post.media_urls[0]}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                                        />
                                                        {post.media_urls.length > 1 && (
                                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
                                                                +{post.media_urls.length - 1}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-sm font-serif italic">Xem album</span>
                                                        </div>
                                                    </div>
                                                ) : post.media_url ? (
                                                    <div
                                                        className="relative aspect-video overflow-hidden cursor-pointer"
                                                        onClick={() => openGallery(post, 0)}
                                                    >
                                                        <Image
                                                            src={post.media_url}
                                                            alt={post.title}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                ) : null}

                                                <div className="p-5">
                                                    {!post.media_url && (
                                                        <Quote className="w-6 h-6 text-rose-gold/20 mb-2" />
                                                    )}
                                                    <p className="text-white/60 font-serif italic leading-relaxed text-sm">
                                                        {post.content}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-4 text-xs text-white/20">
                                                        <button className="flex items-center gap-1 hover:text-rose-gold transition-colors">
                                                            <Heart className="w-3 h-3" /> Thích
                                                        </button>
                                                        {post.user_id === currentRole && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex items-center gap-1 hover:text-rose-gold transition-colors ml-2">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="bg-surface border-rose-gold/10 text-white">
                                                                    {/* Edit feature to be fully implemented later */}
                                                                    <DropdownMenuItem
                                                                        className="focus:bg-rose-gold/10 focus:text-rose-gold cursor-pointer"
                                                                        onClick={() => handleEdit(post)}
                                                                    >
                                                                        <Pencil className="w-4 h-4 mr-2" />
                                                                        Chỉnh sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer"
                                                                        onClick={() => handleDelete(post)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Xóa
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )
                })}
            </div>

            {/* Add/Edit Memory FAB */}
            <Dialog open={addOpen} onOpenChange={(open) => {
                if (!open) handleCloseDialog();
                else setAddOpen(true);
            }}>
                <DialogTrigger asChild>
                    <motion.button
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-rose-gold text-background shadow-lg shadow-rose-gold/20 flex items-center justify-center z-40 hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Plus className="w-7 h-7" />
                    </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-rose-gold/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif italic text-center text-white">
                            {editingPostId ? "Chỉnh sửa kỷ niệm" : "Thêm kỷ niệm mới"}
                        </DialogTitle>
                        <p className="text-center text-rose-gold/50 font-serif text-sm">
                            Lưu giữ khoảnh khắc này mãi mãi
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Upload area */}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(newPost.media_urls || []).map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-rose-gold/10">
                                    <Image
                                        src={url}
                                        alt={`Upload ${index}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => setNewPost(p => ({
                                            ...p,
                                            media_urls: p.media_urls.filter((_, i) => i !== index)
                                        }))}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <div className="relative border-2 border-dashed border-rose-gold/20 rounded-xl flex flex-col items-center justify-center p-4 hover:border-rose-gold/40 transition-colors aspect-square cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                            const uploadedUrls: string[] = [];
                                            // Handle upload one by one for now
                                            for (const file of files) {
                                                const url = await uploadFile(file);
                                                if (url) uploadedUrls.push(url);
                                            }
                                            setNewPost(p => ({ ...p, media_urls: [...p.media_urls, ...uploadedUrls] }));
                                        }
                                    }}
                                />
                                {uploading ? (
                                    <div className="animate-spin w-6 h-6 border-2 border-rose-gold border-t-transparent rounded-full" />
                                ) : (
                                    <Plus className="w-8 h-8 text-rose-gold/40 group-hover:text-rose-gold transition-colors" />
                                )}
                                <p className="text-xs text-rose-gold/40 mt-2">Thêm ảnh</p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white/60 mb-2">Tiêu đề</Label>
                            <Input
                                value={newPost.title}
                                onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Chuyện gì đã xảy ra?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60 mb-2">Ngày</Label>
                            <Input
                                type="date"
                                value={newPost.event_date}
                                onChange={(e) => setNewPost((p) => ({ ...p, event_date: e.target.value }))}
                                className="bg-background border-rose-gold/10 text-white focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60 mb-2">Chia sẻ suy nghĩ</Label>
                            <Textarea
                                value={newPost.content}
                                onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                                placeholder="Điều gì làm khoảnh khắc này đặc biệt?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 min-h-[100px] focus-visible:ring-rose-gold/30 font-serif"
                            />
                        </div>

                        <div>
                            <Label className="text-white/60 mb-2">Địa điểm (tùy chọn)</Label>
                            <Input
                                value={newPost.location}
                                onChange={(e) => setNewPost((p) => ({ ...p, location: e.target.value }))}
                                placeholder="Ở đâu thế?"
                                className="bg-background border-rose-gold/10 text-white placeholder:text-white/20 focus-visible:ring-rose-gold/30"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={!newPost.title.trim() || !newPost.content.trim() || uploading}
                            className="w-full bg-rose-gold hover:bg-rose-gold-dark text-background font-serif py-5 disabled:opacity-30"
                        >
                            {uploading ? "Đang tải lên..." : (editingPostId ? "Lưu thay đổi" : "Đăng lên dòng thời gian")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Gallery Dialog */}
            <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                <DialogContent className="max-w-4xl bg-black/90 border-none p-0 overflow-hidden h-[90vh] flex flex-col justify-center">
                    {selectedPost && (
                        <div className="relative w-full h-full flex flex-col">
                            {/* <button
                                onClick={() => setGalleryOpen(false)}
                                className="absolute top-4 right-4 z-50 text-white/50 hover:text-white p-2"
                            >
                                <X className="w-6 h-6" />
                            </button> */}

                            <div className="flex-1 relative flex items-center justify-center bg-black">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="relative w-full h-full p-4"
                                    >
                                        <Image
                                            src={selectedPost.media_urls?.[currentImageIndex] || selectedPost.media_url!}
                                            alt="Gallery"
                                            fill
                                            className="object-contain"
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                {(selectedPost.media_urls?.length || 0) > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="p-6 bg-surface/90 backdrop-blur-md border-t border-white/10 shrink-0">
                                <h3 className="text-xl font-serif italic text-white mb-2">{selectedPost.title}</h3>
                                <p className="text-white/70 text-sm max-h-32 overflow-y-auto">{selectedPost.content}</p>
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                    {selectedPost.media_urls?.map((url, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-colors ${idx === currentImageIndex ? "border-rose-gold" : "border-transparent opacity-50 hover:opacity-100"
                                                }`}
                                        >
                                            <Image src={url} alt="thumbnail" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

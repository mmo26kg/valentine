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
    MessageCircle,
    Send,
    Smile,
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
import { usePostComments, useProfiles } from "@/lib/store";
import { Comment, Profile } from "@/lib/types";

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

function CommentItem({ comment, currentRole, profiles, onDelete, onReact }: {
    comment: Comment,
    currentRole: "ảnh" | "ẻm",
    profiles: Record<string, Profile>,
    onDelete: (id: string) => void,
    onReact: (id: string, userId: string, emoji: string) => void
}) {
    // Map user_id to profile role ('him'/'her')
    const roleMap: Record<string, string> = { "him": "ảnh", "her": "ẻm", "ảnh": "him", "ẻm": "her" };
    // comment.user_id is 'him' or 'her' usually
    const isOwner = comment.user_id === (currentRole === "ảnh" ? "him" : "her");

    const userProfile = profiles[comment.user_id];
    const avatar = userProfile?.avatar_url || "/images/default-avatar.png";
    const name = userProfile?.name || (comment.user_id === "him" ? "Anh" : "Em");

    // Check reaction
    const myId = currentRole === "ảnh" ? "him" : "her";
    const hasReacted = comment.reactions?.[myId];

    return (
        <div className="flex gap-3 text-sm group/comment">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                <Image src={avatar} alt={name} width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="bg-white/5 rounded-2xl rounded-tl-none px-3 py-2 inline-block max-w-full">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-rose-gold text-xs">{name}</span>
                        <span className="text-[10px] text-white/30">{format(new Date(comment.created_at), "HH:mm dd/MM")}</span>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap wrap-break-word">{comment.content}</p>
                </div>

                {/* Reactions & Actions */}
                <div className="flex items-center gap-4 text-xs text-white/40 pl-2">
                    <button
                        onClick={() => onReact(comment.id, myId, "❤️")}
                        className={`flex items-center gap-1 hover:text-rose-gold transition-colors ${hasReacted ? "text-rose-gold" : ""}`}
                    >
                        {hasReacted ? <Heart className="w-3 h-3 fill-rose-gold" /> : <Heart className="w-3 h-3" />}
                        {Object.keys(comment.reactions || {}).length > 0 && (
                            <span>{Object.keys(comment.reactions || {}).length}</span>
                        )}
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="hover:text-red-400 transition-colors opacity-0 group-hover/comment:opacity-100"
                        >
                            Xóa
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Sub-components ---

function PostDetailView({
    post,
    currentRole,
    profiles,
    onClose
}: {
    post: TimelinePost,
    currentRole: "ảnh" | "ẻm",
    profiles: Record<string, Profile>,
    onClose: () => void
}) {
    const { comments, addComment, toggleReaction, deleteComment } = usePostComments(post.id);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        const myId = currentRole === "ảnh" ? "him" : "her";
        await addComment(newComment.trim(), myId);
        setNewComment("");
        setIsSubmitting(false);
    };

    const nextImage = () => {
        const total = (post.media_urls?.length || (post.media_url ? 1 : 0));
        setCurrentImageIndex((prev) => (prev + 1) % total);
    };

    const prevImage = () => {
        const total = (post.media_urls?.length || (post.media_url ? 1 : 0));
        setCurrentImageIndex((prev) => (prev - 1 + total) % total);
    };

    const hasMedia = (post.media_urls?.length || 0) > 0 || !!post.media_url;

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-surface text-white overflow-hidden rounded-xl">
            {/* Left: Media (or Top on mobile) */}
            <div className={`relative bg-black flex items-center justify-center ${hasMedia ? "w-full md:w-3/5 h-1/2 md:h-full" : "hidden"}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full"
                    >
                        {hasMedia && (
                            <Image
                                src={post.media_urls?.[currentImageIndex] || post.media_url!}
                                alt="Detail"
                                fill
                                className="object-contain"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {(post.media_urls?.length || 0) > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Thumbnails Overlay (Bottom of media) */}
                {(post.media_urls?.length || 0) > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 no-scrollbar z-10">
                        {post.media_urls?.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`relative w-10 h-10 rounded-md overflow-hidden shrink-0 border-2 transition-all ${idx === currentImageIndex ? "border-rose-gold scale-110" : "border-white/20 opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <Image src={url} alt="thumb" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info & Comments (or Bottom on mobile) */}
            <div className={`flex flex-col h-full bg-surface border-l border-white/5 ${hasMedia ? "w-full md:w-2/5" : "w-full md:max-w-2xl md:mx-auto border-x"}`}>
                {/* Header Info */}
                <div className="p-4 border-b border-white/5 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-serif italic text-white mb-1">{post.title}</h2>
                            <p className="text-rose-gold/50 text-xs uppercase tracking-widest">{format(new Date(post.event_date), "d MMMM, yyyy")}</p>
                        </div>
                        {/* <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button> */}
                    </div>
                    {post.location && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-white/40">
                            <MapPin className="w-3 h-3" />
                            {post.location}
                        </div>
                    )}
                    <p className="mt-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
                        {post.content}
                    </p>
                </div>

                {/* Comments List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm italic">Chưa có bình luận nào</p>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentRole={currentRole}
                                profiles={profiles}
                                onDelete={deleteComment}
                                onReact={toggleReaction}
                            />
                        ))
                    )}
                </div>

                {/* Input Area (Sticky Bottom) */}
                <div className="p-4 border-t border-white/5 bg-surface shrink-0">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Viết bình luận..."
                                className="h-10 pl-3 pr-10 bg-white/5 border-white/10 text-white focus-visible:ring-rose-gold/30 rounded-full text-sm"
                            />
                            <Smile className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 cursor-pointer hover:text-rose-gold transition-colors" />
                        </div>
                        <Button
                            size="icon"
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSubmitting}
                            className="h-10 w-10 rounded-full bg-rose-gold hover:bg-rose-gold/80 flex items-center justify-center shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelinePostCard({
    post, currentRole, openGallery, handleEdit, handleDelete, profiles
}: {
    post: TimelinePost,
    currentRole: "ảnh" | "ẻm",
    openGallery: (post: TimelinePost, index: number) => void,
    handleEdit: (post: TimelinePost) => void,
    handleDelete: (post: TimelinePost) => void,
    profiles: Record<string, Profile>
}) {
    const { comments, addComment, toggleReaction, deleteComment } = usePostComments(post.id);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Limit displayed comments
    const VISIBLE_COMMENTS = 3;
    const displayedComments = comments.slice(0, VISIBLE_COMMENTS);
    const hasMoreComments = comments.length > VISIBLE_COMMENTS;

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        const myId = currentRole === "ảnh" ? "him" : "her";
        await addComment(newComment.trim(), myId);
        setNewComment("");
        setIsSubmitting(false);
    };

    return (
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
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-serif italic">Xem chi tiết</span>
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
                {!post.media_url && !post.media_urls?.length && (
                    <Quote className="w-6 h-6 text-rose-gold/20 mb-2" />
                )}
                <div
                    onClick={() => openGallery(post, 0)}
                    className="cursor-pointer group/content"
                >
                    <p className="text-white/60 font-serif italic leading-relaxed text-sm group-hover/content:text-white/80 transition-colors">
                        {post.content}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-4 text-xs text-white/20 border-t border-white/5 pt-3">
                    <button className="flex items-center gap-1 hover:text-rose-gold transition-colors">
                        <Heart className="w-3 h-3" /> Thích
                    </button>

                    <button
                        className={`flex items-center gap-1 hover:text-rose-gold transition-colors ${showComments ? "text-rose-gold" : ""}`}
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle className="w-3 h-3" />
                        {comments.length > 0 ? `${comments.length} Bình luận` : "Bình luận"}
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                        {post.user_id === currentRole && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1 hover:text-rose-gold transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-surface border-rose-gold/10 text-white">
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

                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-3">
                                <div className="space-y-3">
                                    {displayedComments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            currentRole={currentRole}
                                            profiles={profiles}
                                            onDelete={deleteComment}
                                            onReact={toggleReaction}
                                        />
                                    ))}

                                    {/* Show "View More" button if needed */}
                                    {hasMoreComments && (
                                        <button
                                            onClick={() => openGallery(post, 0)}
                                            className="w-full text-left text-xs text-rose-gold/70 hover:text-rose-gold transition-colors py-1 pl-1"
                                        >
                                            Xem thêm {comments.length - VISIBLE_COMMENTS} bình luận khác...
                                        </button>
                                    )}

                                    {comments.length === 0 && (
                                        <p className="text-center text-white/20 text-xs py-2 italic">Chưa có bình luận nào.</p>
                                    )}
                                </div>

                                {/* Mini Input Inline */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Viết bình luận..."
                                        className="h-8 text-xs bg-white/5 border-white/10 text-white focus-visible:ring-rose-gold/30 rounded-full"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="h-8 w-8 p-0 rounded-full bg-rose-gold hover:bg-rose-gold/80"
                                    >
                                        <Send className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function TimelineTab({ posts, currentRole, onAddPost, onDeletePost, onUpdatePost }: TimelineTabProps) {
    const { uploadFile, isUploading: uploading } = useUpload();
    const { profiles } = useProfiles();
    const [filterYear, setFilterYear] = useState<string | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);

    // Gallery / Detail State
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<TimelinePost | null>(null);
    // currentImageIndex is handled inside PostDetailView now usually, but we keep it if we want init state
    // Actually PostDetailView handles its own index state to be self-contained for the view

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
        // We can pass index if we want deep linking to specific image, but for now defaults to 0
        setGalleryOpen(true);
    };

    // ... (rest of filtering logic) => SAME 
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
                                            <TimelinePostCard
                                                post={post}
                                                currentRole={currentRole}
                                                openGallery={openGallery}
                                                handleEdit={handleEdit}
                                                handleDelete={handleDelete}
                                                profiles={profiles}
                                            />
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

            {/* Post Detail Dialog (Was Gallery) */}
            <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                <DialogContent className="max-w-7xl! w-full p-0 overflow-hidden h-[90vh] md:h-[90vh] border-none bg-transparent">
                    {selectedPost && (
                        <PostDetailView
                            post={selectedPost}
                            currentRole={currentRole}
                            profiles={profiles}
                            onClose={() => setGalleryOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

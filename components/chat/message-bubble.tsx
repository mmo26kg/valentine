import { ChatMessage } from "@/lib/types";
import { useCurrentUser } from "@/lib/store";
import { useValentineAuth } from "@/providers/valentine-provider";
import { cn } from "@/lib/utils";
import { formatVietnamDate } from "@/lib/date-utils";
import { Check, CheckCheck, FileText, Play, MoreHorizontal, Pencil, Trash2, X, Save, Reply } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LinkPreviewCard } from "./link-preview-card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
    message: ChatMessage;
    showAvatar?: boolean;
    onLinkClick?: (type: "post" | "event" | "caption", id: string) => void;
    onEdit?: (id: string, newContent: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    replyMessage?: ChatMessage;
}

export function MessageBubble({ message, showAvatar = true, onLinkClick, onEdit, onDelete, onReply, replyMessage }: MessageBubbleProps & { onReply?: (id: string) => void }) {
    const { role } = useCurrentUser();
    const { profiles } = useValentineAuth();
    const isMe = role === (message.sender_id === "him" ? "ảnh" : "ẻm");
    const [imageOpen, setImageOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const senderProfile = profiles[message.sender_id === "him" ? "him" : "her"];
    const avatarUrl = senderProfile?.avatar_url || (message.sender_id === "him" ? "/images/default-avatar-him.png" : "/images/default-avatar-her.png");

    const handleSaveEdit = async () => {
        if (editContent.trim() !== message.content) {
            await onEdit?.(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    return (
        <div className={cn("flex w-full mb-4 group/message", isMe ? "justify-end" : "justify-start")}>
            {/* Avatar for partner */}
            {!isMe && showAvatar && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 shrink-0 border border-border">
                    <img
                        src={avatarUrl}
                        alt={message.sender_id === "him" ? "Anh" : "Em"}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className={cn("max-w-[75%] flex flex-col relative", isMe ? "items-end" : "items-start")}>
                {/* Options Menu */}
                {!isEditing && (
                    <div className={cn(
                        "absolute top-0 transition-opacity z-10",
                        isMe ? "-left-8" : "-right-8",
                        // Mobile: Always visible (or at least accessible via tap). Desktop: Hover.
                        // Actually user requested "always visible on mobile". 
                        // It's cleaner to just make it visible or use CSS media queries if needed.
                        // But "always visible" might clutter. 
                        // Let's use opacity-100 for touch devices if possible, or just remove opacity-0.
                        // Given the request "trên mobile, luôn hiện", removing opacity-0 is simplest.
                        "opacity-100"
                    )}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-full hover:bg-muted/50 text-muted-foreground/50 hover:text-foreground transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"}>
                                <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                                    <Reply className="w-4 h-4 mr-2" /> Trả lời
                                </DropdownMenuItem>
                                {isMe && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete?.(message.id)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" /> Xóa tin nhắn
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Reply Context */}
                {message.reply_to_type && message.reply_to_ref_id && (
                    <div className="mb-1 -mt-1 scale-90 origin-bottom-left max-w-full">
                        {message.reply_to_type === 'message' ? (
                            <div className="flex flex-col text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md mb-1 border-l-2 border-primary/50 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => {
                                    // Optional: Scroll to message?
                                }}
                            >
                                {replyMessage ? (
                                    <>
                                        <span className="font-semibold text-[10px] opacity-70 mb-0.5">{replyMessage.sender_id === 'him' ? 'Anh' : 'Em'}</span>
                                        <span className="truncate line-clamp-1 italic">{replyMessage.content || (replyMessage.media_urls?.length ? "Hình ảnh/Video" : "Tập tin")}</span>
                                    </>
                                ) : (
                                    <span className="italic">Tin nhắn đã bị xóa hoặc không có sẵn</span>
                                )}
                            </div>
                        ) : (
                            <LinkPreviewCard
                                type={message.reply_to_type as any}
                                id={message.reply_to_ref_id}
                                onClick={() => onLinkClick?.(message.reply_to_type as any, message.reply_to_ref_id!)}
                            />
                        )}
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2 shadow-sm relative text-sm wrap-break-word",
                        isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none border border-border",
                        isEditing && "w-full min-w-[200px]"
                    )}
                >
                    {/* Media */}
                    {(message.media_urls && message.media_urls.length > 0) ? (
                        <div className={cn("mb-2 mt-1 gap-1", message.media_urls.length > 1 ? "grid grid-cols-2" : "flex")}>
                            {message.media_urls.map((url, index) => (
                                <div key={index} className="rounded-lg overflow-hidden relative aspect-square min-w-[120px] bg-muted/20">
                                    {message.media_type === "image" ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="w-full h-full cursor-pointer">
                                                    <img
                                                        src={url}
                                                        alt={`Attachment ${index + 1}`}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                                                    />
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                                <img
                                                    src={url}
                                                    alt="Full size"
                                                    className="max-h-[85vh] w-auto max-w-[95vw] object-contain rounded-md"
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    ) : message.media_type === "video" ? (
                                        <video controls src={url} className="w-full h-full object-cover" />
                                    ) : (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full h-full bg-black/10 hover:bg-black/20 transition-colors p-2"
                                        >
                                            <FileText className="w-8 h-8 opacity-70" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : message.media_url && (
                        /* Legacy support for single media_url */
                        <div className="mb-2 mt-1 rounded-lg overflow-hidden max-w-full">
                            {message.media_type === "image" ? (
                                <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                                    <DialogTrigger asChild>
                                        <div className="bg-muted min-h-[150px] min-w-[200px] rounded-md cursor-pointer">
                                            <img
                                                src={message.media_url}
                                                alt="Attachment"
                                                loading="lazy"
                                                className="w-full h-auto max-h-60 object-cover hover:opacity-95 transition-opacity rounded-md"
                                            />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                        <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                                            <img
                                                src={message.media_url}
                                                alt="Full size"
                                                className="max-h-[85vh] w-auto max-w-[95vw] object-contain rounded-md"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : message.media_type === "video" ? (
                                <video controls src={message.media_url} className="max-h-60 w-full object-cover rounded-lg" />
                            ) : (
                                <a
                                    href={message.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-black/10 p-2 rounded hover:bg-black/20 transition-colors"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span className="underline truncate">Tập tin đính kèm</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Text Content (Normal or Edit Mode) */}
                    {isEditing ? (
                        <div className="flex flex-col gap-2 mt-1">
                            <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="bg-background/50 border-white/20 text-foreground"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="h-6 px-2 hover:bg-white/20" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 px-2 hover:bg-white/20" onClick={handleSaveEdit}>
                                    <Save className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        message.content && (
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                                {message.is_edited && <span className="text-[10px] opacity-60 italic ml-1">(đã sửa)</span>}
                            </p>
                        )
                    )}

                    {/* Time & Status */}
                    <div className={cn("flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70", isMe ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        <span>{formatVietnamDate(message.created_at, "HH:mm")}</span>
                        {isMe && (
                            <span>
                                {message.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

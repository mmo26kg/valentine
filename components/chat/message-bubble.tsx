import { ChatMessage } from "@/lib/types";
import { useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatVietnamDate } from "@/lib/date-utils";
import { Check, CheckCheck, FileText, Play, MoreHorizontal, Pencil, Trash2, X, Save } from "lucide-react";
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
}

export function MessageBubble({ message, showAvatar = true, onLinkClick, onEdit, onDelete }: MessageBubbleProps) {
    const { role } = useCurrentUser();
    const isMe = role === (message.sender_id === "him" ? "ảnh" : "ẻm");
    const [imageOpen, setImageOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

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
                    {/* Placeholder or real avatar logic passed down? For now simple placeholders based on sender_id */}
                    <div className={cn("w-full h-full flex items-center justify-center text-[10px] font-bold text-white", message.sender_id === "him" ? "bg-blue-400" : "bg-pink-400")}>
                        {message.sender_id === "him" ? "A" : "E"}
                    </div>
                </div>
            )}

            <div className={cn("max-w-[75%] flex flex-col relative", isMe ? "items-end" : "items-start")}>
                {/* Options Menu (Only for own messages) */}
                {isMe && !isEditing && (
                    <div className="absolute top-0 -left-8 opacity-0 group-hover/message:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete?.(message.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa tin nhắn
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Reply Context */}
                {message.reply_to_type && message.reply_to_ref_id && (
                    <div className="mb-1 -mt-1 scale-90 origin-bottom-left">
                        <LinkPreviewCard
                            type={message.reply_to_type as any}
                            id={message.reply_to_ref_id}
                            onClick={() => onLinkClick?.(message.reply_to_type as any, message.reply_to_ref_id!)}
                        />
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
                                <div key={index} className="rounded-lg overflow-hidden max-w-full relative aspect-square">
                                    {message.media_type === "image" ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <img
                                                    src={url}
                                                    alt={`Attachment ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                                                />
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                                <img
                                                    src={url}
                                                    alt="Full size"
                                                    className="max-h-[90vh] max-w-full object-contain rounded-md"
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
                                        <img
                                            src={message.media_url}
                                            alt="Attachment"
                                            className="max-h-60 object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                                        />
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                                        <img
                                            src={message.media_url}
                                            alt="Full size"
                                            className="max-h-[90vh] max-w-full object-contain rounded-md"
                                        />
                                    </DialogContent>
                                </Dialog>
                            ) : message.media_type === "video" ? (
                                <video controls src={message.media_url} className="max-h-60 rounded-lg" />
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

import React, { useState, useRef } from "react";
import { Send, Paperclip, X, Image as ImageIcon, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LinkPreviewCard } from "./link-preview-card";
import { ChatMessage } from "@/lib/types";

interface ChatInputProps {
    onSendMessage: (content: string, replyTo?: { type: "post" | "event" | "caption" | "message", id: string }) => Promise<void>;
    onSendFile: (files: File[], type: "image" | "video" | "file", replyTo?: { type: "post" | "event" | "caption" | "message", id: string }) => Promise<void>;
    replyTo?: { type: "post" | "event" | "caption" | "message", id: string } | null;
    replyMessage?: ChatMessage;
    onCancelReply?: () => void;
}

export function ChatInput({ onSendMessage, onSendFile, replyTo, replyMessage, onCancelReply }: ChatInputProps) {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isSending) handleSend();
        }
    };

    const handleSend = async () => {
        if (!content.trim()) return;
        setIsSending(true);
        try {
            await onSendMessage(content, replyTo || undefined);
            setContent("");
            if (replyTo && onCancelReply) onCancelReply();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
            // Keep focus
            textareaRef.current?.focus();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsSending(true);
        try {
            const filesArray = Array.from(files);
            const type = filesArray[0].type.startsWith("image/") ? "image" : filesArray[0].type.startsWith("video/") ? "video" : "file";

            // Validate total size (e.g., 50MB max per batch)
            const totalSize = filesArray.reduce((acc, file) => acc + file.size, 0);
            if (totalSize > 50 * 1024 * 1024) {
                toast.error("Tổng dung lượng file quá lớn (Max 50MB)");
                return;
            }

            await onSendFile(filesArray, type, replyTo || undefined);
            if (replyTo && onCancelReply) onCancelReply();
        } catch (error) {
            console.error("Failed to upload files", error);
        } finally {
            setIsSending(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="p-1">
            {/* Reply Context Preview */}
            {replyTo && (
                <div className="flex items-center justify-between bg-muted/90 backdrop-blur-md p-2 rounded-t-2xl mb-2 border border-border/50 shadow-sm">
                    <div className="text-xs text-muted-foreground flex items-center gap-2 max-w-[85%]">
                        <span className="font-semibold text-primary shrink-0">Đang trả lời:</span>
                        {replyTo.type === 'message' && replyMessage ? (
                            <div className="flex flex-col truncate border-l-2 border-primary/50 pl-2">
                                {/* <span className="font-semibold">{replyMessage.sender_id === 'him' ? 'Anh' : 'Em'}</span> */}
                                <span className="truncate opacity-80">{replyMessage.content || "Tập tin đính kèm"}</span>
                            </div>
                        ) : replyTo.type === 'message' ? (
                            <span className="italic">Tin nhắn không có sẵn</span>
                        ) : (
                            <div className="scale-90 origin-left">
                                <LinkPreviewCard type={replyTo.type as any} id={replyTo.id} />
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full shrink-0" onClick={onCancelReply}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <div className="flex gap-1 shrink-0 pb-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,application/pdf"
                        multiple
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 relative rounded-full bg-muted/80 hover:bg-muted/90 backdrop-blur-sm border border-white/10 focus-within:bg-background/80 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        className="min-h-[44px] max-h-[120px] bg-transparent border-none shadow-none resize-none py-3 px-4 focus-visible:ring-0 text-sm"
                        disabled={false} // Don't disable input to keep keyboard open on mobile
                    />
                </div>

                <div className="shrink-0 pb-1">
                    <Button
                        size="icon"
                        className={cn("rounded-full h-10 w-10 transition-all duration-300", content.trim() ? "opacity-100 scale-100" : "opacity-50 scale-90")}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent focus loss?
                            handleSend();
                        }}
                        disabled={!content.trim() || isSending}
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

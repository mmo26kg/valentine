"use client";

import { useEffect, useRef, useState } from "react";
import { useChat, useCurrentUser } from "@/lib/store";
import { useValentineAuth } from "@/providers/valentine-provider";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, MoreHorizontal, Phone, Video } from "lucide-react";
import { formatVietnamDate } from "@/lib/date-utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ChatScreenProps {
    onClose: () => void;
    initialContext?: { type: "post" | "event" | "caption", id: string };
}

export function ChatScreen({ onClose, initialContext }: ChatScreenProps) {
    const { messages, sendMessage, sendFiles, editMessage, deleteMessage, markAllRead } = useChat();
    const { role } = useCurrentUser();
    const { profiles } = useValentineAuth();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [replyContext, setReplyContext] = useState<{ type: "post" | "event" | "caption", id: string } | null>(initialContext || null);

    const partnerRole = role === "ảnh" ? "her" : "him";
    const partnerProfile = profiles[partnerRole];
    const partnerName = partnerProfile?.name || (role === "ảnh" ? "Em" : "Anh");
    const partnerAvatar = partnerProfile?.avatar_url || (role === "ảnh" ? "/images/default-avatar-her.png" : "/images/default-avatar-him.png");

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Mark messages as read when screen is open
    useEffect(() => {
        markAllRead();
    }, [messages.length, markAllRead]);

    // Handle initial context passed
    useEffect(() => {
        if (initialContext) {
            setReplyContext(initialContext);
        }
    }, [initialContext]);

    // Group messages by date
    const groupedMessages = messages.reduce((acc, message) => {
        const date = formatVietnamDate(message.created_at, "dd/MM/yyyy");
        if (!acc[date]) acc[date] = [];
        acc[date].push(message);
        return acc;
    }, {} as Record<string, typeof messages>);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1518199266791-5375a83190b2?q=80&w=2940&auto=format&fit=crop"
                    alt="Chat Background"
                    fill
                    className="object-cover opacity-20 dark:opacity-10 blur-sm"
                />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </div>

            {/* Header */}
            <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-white/10 text-foreground"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                <Image src={partnerAvatar} alt={partnerName} width={40} height={40} className="object-cover w-full h-full" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg font-medium text-foreground leading-tight">{partnerName}</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Thinking of you...</p>
                        </div>
                    </div>
                </div>

                {/* <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-foreground hover:bg-white/10">
                        <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-foreground hover:bg-white/10">
                        <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-foreground hover:bg-white/10">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div> */}
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 relative z-10 px-4">
                <div className="space-y-6 py-6 min-h-full flex flex-col justify-end">
                    {/* Welcome Message / Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="font-serif text-xl italic mb-2">Private Sanctuary</h3>
                            <p className="text-sm text-muted-foreground">Bắt đầu cuộc trò chuyện đầy yêu thương...</p>
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center mb-6 sticky top-0 z-20">
                                <span className="text-[10px] font-medium tracking-widest uppercase bg-background/50 backdrop-blur border border-white/5 text-muted-foreground px-3 py-1 mt-2 rounded-full shadow-sm">
                                    {date}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {msgs.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        onLinkClick={(type, id) => {
                                            // TODO: Handle navigation better. For now just close chat and let URL handle it if possible.
                                            // Or maybe we keep chat open? The user likely wants to see the content.
                                            // We can close chat and navigate.
                                            const url = `/?tab=${type === 'caption' ? 'home' : type === 'post' ? 'timeline' : 'countdown'}&${type === 'caption' ? 'caption' : type === 'post' ? 'post' : 'countdown'}=${id}`;
                                            window.location.href = url; // Simplest way to ensure tab switch + param
                                        }}
                                        onEdit={editMessage}
                                        onDelete={deleteMessage}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="relative z-20 pb-6 pt-2 px-4 bg-linear-to-t from-background via-background to-transparent">
                <div className="max-w-3xl mx-auto">
                    <ChatInput
                        onSendMessage={async (content, replyTo) => {
                            await sendMessage(content, replyTo || undefined);
                            setReplyContext(null);
                        }}
                        onSendFile={async (files, type, replyTo) => {
                            await sendFiles(files, type, replyTo || undefined);
                            setReplyContext(null);
                        }}
                        replyTo={replyContext}
                        onCancelReply={() => setReplyContext(null)}
                    />
                </div>
            </div>
        </motion.div>
    );
}

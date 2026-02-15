"use client";

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { useChat, useCurrentUser } from "@/lib/store";
import { ChatMessage } from "@/lib/types";
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
    initialContext?: { type: "post" | "event" | "caption" | "message", id: string };
}

export function ChatScreen({ onClose, initialContext }: ChatScreenProps) {
    const { messages, sendMessage, sendFiles, editMessage, deleteMessage, markAllRead, loadMoreMessages, hasMore, isLoadingMore } = useChat();
    const { role } = useCurrentUser();
    const { profiles } = useValentineAuth();
    const scrollRef = useRef<HTMLDivElement>(null); // For ScrollArea viewport
    const bottomRef = useRef<HTMLDivElement>(null); // For auto-scroll to bottom
    const [replyContext, setReplyContext] = useState<{ type: "post" | "event" | "caption" | "message", id: string } | null>(initialContext || null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const partnerRole = role === "ảnh" ? "her" : "him";
    const partnerProfile = profiles[partnerRole];
    const partnerName = partnerProfile?.name || (role === "ảnh" ? "Em" : "Anh");
    const partnerAvatar = partnerProfile?.avatar_url || (role === "ảnh" ? "/file.svg" : "/file.svg");

    // Auto-scroll to bottom only on NEW messages or Initial Load
    // And maintain scroll position when loading more
    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollElement = scrollRef.current;
        const isFromLoadMore = !isInitialLoad && isLoadingMore; // Capture this before effect runs? No, isLoadingMore changes.

        // Actually, we can use a ref to store previous scroll height
    }, [messages, isLoadingMore, isInitialLoad]);

    // And maintain scroll position when loading more
    // Actually, we can use a ref to store previous scroll height
    // We need to capture scroll height BEFORE messages update if we are loading more.
    // But we don't know exactly when messages update.
    // Use layout effect?
    // Let's use a ref to track the LAST message ID to detect prepend.

    const lastMessageIdRef = useRef<string | null>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const prevScrollTopRef = useRef<number>(0);

    // Snapshot before update
    // We can't easily snapshot "before" in functional component render without useLayoutEffect or careful ordering.
    // But we know when we CLICK play load more.

    // Let's update the loadMore handler to snapshot.

    // Auto-scroll to bottom only on NEW messages or Initial Load
    // And maintain scroll position when loading more
    useLayoutEffect(() => {
        if (!scrollRef.current) return;

        // Find the actual scrollable viewport (inner div of ScrollArea)
        const viewport = scrollRef.current.firstElementChild as HTMLElement;
        if (!viewport) return;

        if (isInitialLoad && messages.length > 0) {
            if (bottomRef.current) {
                // Determine if we should smooth scroll or instant
                // Instant is better for initial load
                bottomRef.current.scrollIntoView({ behavior: "auto" });
            }
            setIsInitialLoad(false);
            if (messages.length > 0) lastMessageIdRef.current = messages[messages.length - 1].id;
            return;
        }

        const lastMessage = messages[messages.length - 1];
        const isNewMessage = lastMessage && lastMessage.id !== lastMessageIdRef.current;

        if (isNewMessage) {
            // New message appended
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            lastMessageIdRef.current = lastMessage.id;
        } else if (messages.length > 0 && lastMessageIdRef.current === lastMessage.id) {
            // Messages changed but last one is same => Prepend (Load More)
            // Restore scroll position
            if (prevScrollHeightRef.current > 0) {
                const newScrollHeight = viewport.scrollHeight;
                const diff = newScrollHeight - prevScrollHeightRef.current;

                if (diff > 0) {
                    viewport.scrollTop = prevScrollTopRef.current + diff;
                }
            }
        }

        // Update last message ref
        lastMessageIdRef.current = lastMessage ? lastMessage.id : null;

    }, [messages, isInitialLoad]);

    // Snapshot function
    const handleLoadMore = () => {
        // Find the actual scrollable viewport
        const viewport = scrollRef.current?.firstElementChild as HTMLElement;
        if (viewport) {
            prevScrollHeightRef.current = viewport.scrollHeight;
            prevScrollTopRef.current = viewport.scrollTop;
            // console.log("Snapshot:", viewport.scrollHeight, viewport.scrollTop);
        }
        loadMoreMessages();
    };

    // Mark messages as read when screen is open
    useEffect(() => {
        markAllRead();
    }, [messages.length, markAllRead]);

    // Lock body scroll when chat is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

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

    // Create a map for O(1) message lookup
    const messagesMap = useMemo(() => {
        return messages.reduce((acc, msg) => {
            acc[msg.id] = msg;
            return acc;
        }, {} as Record<string, ChatMessage>);
    }, [messages]);

    return (
        <motion.div
            className="fixed inset-0 max-h-dvh z-50 bg-background flex flex-col overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1554338379-cbfe9dfd523c?q=80&w=872&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
                        className="rounded-full size-12 hover:bg-white/10 text-foreground"
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
            <ScrollArea className="flex-1 relative z-10 px-4" ref={scrollRef}>
                <div className="space-y-6 py-6 min-h-full flex flex-col justify-end max-w-5xl mx-auto">
                    {/* Load More Trigger */}
                    {hasMore && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLoadMore()}
                                disabled={isLoadingMore}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                {isLoadingMore ? "Đang tải..." : "Tải thêm tin nhắn cũ"}
                            </Button>
                        </div>
                    )}

                    {/* Welcome Message / Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="font-serif text-xl italic mb-2">Trò chuyện riêng tư</h3>
                            <p className="text-sm text-muted-foreground">Nói thoải mái, hông sợ bị nghe lén...</p>
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
                                            const url = `/?tab=${type === 'caption' ? 'home' : type === 'post' ? 'timeline' : 'countdown'}&${type === 'caption' ? 'caption' : type === 'post' ? 'post' : 'countdown'}=${id}`;
                                            window.location.href = url;
                                        }}
                                        onEdit={editMessage}
                                        onDelete={deleteMessage}
                                        onReply={(id) => setReplyContext({ type: 'message', id: id })}
                                        replyMessage={msg.reply_to_type === 'message' && msg.reply_to_ref_id ? messagesMap[msg.reply_to_ref_id] : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
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
                        replyMessage={replyContext?.type === 'message' ? messagesMap[replyContext.id] : undefined}
                        onCancelReply={() => setReplyContext(null)}
                    />
                </div>
            </div>
        </motion.div>
    );
}

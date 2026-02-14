import { useEffect, useRef, useState } from "react";
import { useChat, useCurrentUser } from "@/lib/store";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { formatVietnamDate } from "@/lib/date-utils";

interface ChatTabProps {
    initialContext?: { type: "post" | "event" | "caption", id: string };
}

export function ChatTab({ initialContext }: ChatTabProps) {
    const { messages, sendMessage, sendFiles, editMessage, deleteMessage, markAllRead } = useChat();
    const { role } = useCurrentUser();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [replyContext, setReplyContext] = useState<{ type: "post" | "event" | "caption", id: string } | null>(initialContext || null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Mark messages as read when tab is open
    useEffect(() => {
        markAllRead();
    }, [messages.length, markAllRead]);

    // Handle initial context passed from navigation
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
        <div className="flex flex-col h-[calc(100vh-140px)] relative">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6 pb-4">
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center mb-4">
                                <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                                    {date}
                                </span>
                            </div>
                            {msgs.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    onLinkClick={(type, id) => {
                                        // Handle navigation to linked item
                                        // This might require a callback prop or using a comprehensive navigation handler
                                        // For now, we can maybe show a toast or rely on parent handling if we hoist state
                                        // Ideally MainApp handles this via URL params
                                        const url = `/?tab=${type === 'caption' ? 'home' : type === 'post' ? 'timeline' : 'countdown'}&${type === 'caption' ? 'caption' : type === 'post' ? 'post' : 'countdown'}=${id}`;
                                        window.history.pushState({}, "", url);
                                        // Force reload or use a custom event to notify MainApp to update activeTab?
                                        // MainApp listens to URL changes via popstate, but pushState doesn't trigger it by default on same component
                                        // We might need to dispatch a custom event
                                        window.dispatchEvent(new Event("popstate"));
                                    }}
                                    onEdit={editMessage}
                                    onDelete={deleteMessage}
                                />
                            ))}
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <ChatInput
                onSendMessage={async (content, replyTo) => {
                    await sendMessage(content, replyTo || undefined);
                    setReplyContext(null); // Clear context after sending
                }}
                onSendFile={async (files, type, replyTo) => {
                    await sendFiles(files, type, replyTo || undefined);
                    setReplyContext(null);
                }}
                replyTo={replyContext}
                onCancelReply={() => setReplyContext(null)}
            />
        </div>
    );
}

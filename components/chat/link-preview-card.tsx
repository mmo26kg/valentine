import React, { useMemo } from "react";
import { useTimelinePosts, useCountdowns, useDailyCaptions, useEvents } from "@/lib/store";
import { formatVietnamDate } from "@/lib/date-utils";
import { Calendar, Clock, MapPin, MessageSquare, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkPreviewCardProps {
    type: "post" | "event" | "caption";
    id: string; // For post/event it's UUID, for caption it's date string (YYYY-MM-DD)
    onClick?: () => void;
}

export function LinkPreviewCard({ type, id, onClick }: LinkPreviewCardProps) {
    const { posts } = useTimelinePosts();
    const { countdowns } = useCountdowns();
    const { events } = useEvents(); // Also check events if type is event but might be special event
    const { getCaption } = useDailyCaptions();

    const data = useMemo(() => {
        if (type === "post") {
            const post = posts.find((p) => p.id === id);
            if (!post) return null;
            return {
                title: post.title || "Kỷ niệm không tên",
                subtitle: formatVietnamDate(post.event_date || post.created_at, "dd/MM/yyyy"),
                image: post.media_url,
                icon: <ImageIcon className="w-4 h-4" />,
                description: post.content,
            };
        } else if (type === "event") {
            const countdown = countdowns.find((c) => c.id === id);
            // Also check events if not found in countdowns? Assuming 'event' refers to countdowns mostly
            if (!countdown) return null;
            return {
                title: countdown.title,
                subtitle: formatVietnamDate(countdown.date, "dd/MM/yyyy"),
                image: countdown.image_url,
                icon: <Clock className="w-4 h-4" />,
                description: countdown.date
            };
        } else if (type === "caption") {
            // For caption, id is the date
            // We need to fetch both him/her to see who wrote? Or just show generic "Caption ngày ..."
            const date = id;
            return {
                title: `Caption ngày ${formatVietnamDate(date, "dd/MM")}`,
                subtitle: formatVietnamDate(date, "yyyy"),
                image: null,
                icon: <MessageSquare className="w-4 h-4" />,
                description: "Nhấn để xem cảm nghĩ"
            };
        }
        return null;
    }, [type, id, posts, countdowns, getCaption]);

    if (!data) return (
        <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground italic">
            Nội dung không còn tồn tại
        </div>
    );

    return (
        <div
            onClick={onClick}
            className="flex items-start gap-2 bg-muted/50 hover:bg-muted p-2 rounded-lg cursor-pointer transition-colors max-w-sm border border-border/50"
        >
            <div className="shrink-0 rounded-md bg-background border border-border w-10 h-10 flex items-center justify-center overflow-hidden">
                {data.image ? (
                    <img src={data.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-muted-foreground">{data.icon}</div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-foreground truncate">{data.title}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{data.subtitle}</p>
                {data.description && (
                    <p className="text-[10px] text-foreground/70 line-clamp-1 mt-0.5">
                        {data.description}
                    </p>
                )}
            </div>
        </div>
    );
}

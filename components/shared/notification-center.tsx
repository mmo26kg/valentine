"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/lib/store";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { Bell, Check, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
    onNavigate: (tab: string) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const { permission, requestPermission, sendBrowserNotification } = useBrowserNotifications();

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const prevNotificationsCount = useRef(notifications.length);

    // Browser Notification Side Effect
    useEffect(() => {
        if (notifications.length > prevNotificationsCount.current) {
            const newNoti = notifications[0]; // Assuming order is descending
            if (newNoti && !newNoti.is_read) {
                sendBrowserNotification(newNoti.title, {
                    body: newNoti.body,
                    tag: newNoti.id, // Prevent duplicate alerts for same ID
                });
            }
        }
        prevNotificationsCount.current = notifications.length;
    }, [notifications, sendBrowserNotification]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-foreground/80 hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 border-none text-[10px]">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] max-h-[480px] bg-popover border-border text-popover-foreground p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                    <h3 className="font-serif italic text-lg text-primary">Thông báo</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                            }}>
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                        {permission === "default" && (
                            <Button variant="outline" size="sm" className="h-8 text-[10px] text-primary border-border hover:bg-primary/10" onClick={(e) => {
                                e.stopPropagation();
                                requestPermission();
                            }}>
                                Bật thông báo
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground/50 text-sm italic">
                            Chưa có thông báo nào.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "px-4 py-3 hover:bg-muted/50 transition-colors group relative cursor-pointer border-b border-border/50 last:border-0",
                                    !n.is_read && "bg-primary/5"
                                )}
                                onClick={() => {
                                    markAsRead(n.id);
                                    if (n.link) onNavigate(n.link);
                                }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-semibold text-primary/90">{n.title}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                                <p className="text-[13px] text-foreground/70 line-clamp-2 pr-6">{n.body}</p>

                                <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(n.id);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>

                                {!n.is_read && (
                                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

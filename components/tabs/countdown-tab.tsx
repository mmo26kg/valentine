"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    Diamond,
    Cake,
    Gift,
    CalendarHeart,
    Plus,
    Sparkles,
    Pencil,
    Trash2,
    Save,
    MoreHorizontal,
    Settings,
    Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { differenceInDays, differenceInHours, differenceInMinutes, format, startOfDay, addYears, isSameDay, isBefore } from "date-fns";
// import { DEFAULT_COUNTDOWN_EVENTS } from "@/lib/constants";
import { getVietnamDate, formatVietnamDate } from "@/lib/date-utils";
import type { CountdownEvent } from "@/lib/types";
import { useValentine } from "@/providers/valentine-provider";
import { DEFAULT_GREETINGS } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useLongPress } from "@/hooks/use-long-press";

const ICON_MAP: Record<string, React.ElementType> = {
    heart: Heart,
    diamond: Diamond,
    cake: Cake,
    gift: Gift,
    calendar: CalendarHeart,
    sparkles: Sparkles,
};

const ICONS = [
    { name: "heart", icon: Heart },
    { name: "diamond", icon: Diamond },
    { name: "cake", icon: Cake },
    { name: "gift", icon: Gift },
    { name: "calendar", icon: CalendarHeart },
    { name: "sparkles", icon: Sparkles },
];

const TYPES = ["Ngày lễ", "Kỷ niệm", "Sinh nhật", "Khác", "Đi chơi"];

function GreetingItem({ greeting, onDelete }: { greeting: any, onDelete: (id: string) => void }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // const longPressProps = useLongPress(() => {
    //     setDropdownOpen(true);
    // });

    return (
        <div
            className="flex justify-between items-center bg-muted p-3 rounded-lg group relative"
        // {...longPressProps}
        >
            <p className="text-sm text-foreground/90">{greeting.content}</p>

            {/* Desktop Actions */}
            <Button
                onClick={() => onDelete(greeting.id)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
                <Trash2 className="w-3 h-3" />
            </Button>

            {/* Mobile Long Press Indicator */}
            <div className="md:hidden text-muted-foreground/50">
                <Settings className="w-3.5 h-3.5" />
            </div>

            {/* Mobile Long Press Actions */}
            <div className="absolute top-1/2 right-3 -translate-y-1/2 z-30 md:hidden pointer-events-none">
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger className="w-1 h-1 opacity-0 pointer-events-none" />
                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground min-w-[120px]">
                        <DropdownMenuItem onClick={() => {
                            onDelete(greeting.id);
                            setDropdownOpen(false);
                        }} className="focus:bg-destructive/20 focus:text-destructive text-destructive cursor-pointer gap-2">
                            <Trash2 className="w-4 h-4" /> Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function GreetingConfigDialog({
    open,
    onOpenChange
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void
}) {
    const { greetings, addGreeting, deleteGreeting, role } = useValentine();
    const myAuthorId = role === "ảnh" ? "him" : "her";

    // Greetings I have written
    const myGreetings = greetings.filter(g => g.author_id === myAuthorId);

    const [newContent, setNewContent] = useState("");
    const [activeTab, setActiveTab] = useState("morning");

    const handleAdd = () => {
        if (!newContent.trim()) return;
        addGreeting(newContent, activeTab, myAuthorId);
        setNewContent("");
    };

    // return (
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-surface border-border text-foreground max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center font-serif italic text-2xl text-primary">
                        Cấu hình lời chào
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted">
                        <TabsTrigger value="morning">Sáng</TabsTrigger>
                        <TabsTrigger value="afternoon">Trưa</TabsTrigger>
                        <TabsTrigger value="evening">Chiều</TabsTrigger>
                        <TabsTrigger value="night">Tối</TabsTrigger>
                    </TabsList>

                    {["morning", "afternoon", "evening", "night"].map((timeOfDay) => (
                        <TabsContent key={timeOfDay} value={timeOfDay} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Thêm lời chào mới cho buổi {timeOfDay === "morning" ? "Sáng" : timeOfDay === "afternoon" ? "Trưa" : timeOfDay === "evening" ? "Chiều" : "Tối"}:</p>
                                <div className="flex gap-2">
                                    <Input
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        placeholder="Nhập lời chào..."
                                        className="bg-muted border-input text-foreground"
                                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                    />
                                    <Button onClick={handleAdd} size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Danh sách câu chào của bạn:</p>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {myGreetings.filter(g => g.time_of_day === timeOfDay).length === 0 ? (
                                        <p className="text-muted-foreground/60 text-sm italic py-2 text-center">Chưa có câu chào nào.</p>
                                    ) : (
                                        myGreetings
                                            .filter(g => g.time_of_day === timeOfDay)
                                            .map(g => (
                                                <GreetingItem
                                                    key={g.id}
                                                    greeting={g}
                                                    onDelete={deleteGreeting}
                                                />
                                            ))
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function DynamicGreeting({ onEdit }: { onEdit: () => void }) {
    const [greeting, setGreeting] = useState("");
    const { greetings, role } = useValentine();
    const partnerId = role === "ảnh" ? "her" : "him";

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            let timeOfDay: keyof typeof DEFAULT_GREETINGS = "night";

            if (hour >= 5 && hour < 12) timeOfDay = "morning";
            else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
            else if (hour >= 18 && hour < 22) timeOfDay = "evening";

            // 1. Get greetings from partner
            const partnerGreetings = greetings.filter(g => g.author_id === partnerId && g.time_of_day === timeOfDay);

            // 2. Get default greetings
            const defaultGreetings = DEFAULT_GREETINGS[timeOfDay];

            // 3. Choose options
            // System: Prioritize partner greetings. If they exist, use ONLY them.
            let options: string[] = [];

            if (partnerGreetings.length > 0) {
                options = partnerGreetings.map(g => g.content);
            } else {
                options = defaultGreetings;
            }

            // Filter out empty options
            const validOptions = options.filter(Boolean);

            if (validOptions.length > 0) {
                const randomGreeting = validOptions[Math.floor(Math.random() * validOptions.length)];
                setGreeting(randomGreeting);
            }
        };

        // Initial set
        updateGreeting();

        // Rotate every 15 seconds
        const interval = setInterval(updateGreeting, 15000);

        return () => clearInterval(interval);
    }, [greetings, role, partnerId]);

    return (
        <span className="group flex items-center gap-2 relative">
            {greeting}

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="h-6 w-6 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                title="Thay đổi lời chào"
            >
                <Settings className="w-3.5 h-3.5" />
            </Button>
        </span>
    );
}

function getTargetDate(event: CountdownEvent) {
    const now = getVietnamDate();
    const today = startOfDay(now);
    const currentYear = now.getFullYear();

    // Parse base date (ensure it's treated as local VN time midnight)
    // event.date is "YYYY-MM-DD". new Date(event.date) might be UTC or Local depending on browser.
    // Better to use a safe parse that treats it as midnight local.
    const [y, m, d] = event.date.split("-").map(Number);
    // Construct local date (month is 0-indexed)
    let target = new Date(y, m - 1, d);

    // If it's a recurring event, set to current year
    if (["anniversary", "birthday", "holiday"].includes(event.type)) {
        target.setFullYear(currentYear);

        // If the recurring event for this year has strictly passed (yesterday or earlier),
        // move to next year.
        // NOTE: If it is TODAY, we shouldn't move it.
        if (isBefore(target, today)) {
            target = addYears(target, 1);
        }
    }

    return target;
}

function calculateTimeRemaining(target: Date, now: Date) {
    // Check if it's the same day
    const isToday = isSameDay(target, now);

    // If it's today, we don't care about hours/minutes for the countdown
    if (isToday) {
        return { days: 0, hours: 0, minutes: 0, isToday: true };
    }

    const days = differenceInDays(target, now);
    const hours = differenceInHours(target, now) % 24;
    const minutes = differenceInMinutes(target, now) % 60;

    return { days, hours, minutes, isToday: false };
}

interface CountdownCardProps {
    event: CountdownEvent & { targetDate: Date };
    index: number;
    now: Date;
    onEdit: (event: CountdownEvent, e: React.MouseEvent) => void;
    onDelete: (id: string) => void;
}

function CountdownCard({ event, index, now, onEdit, onDelete }: CountdownCardProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const time = calculateTimeRemaining(event.targetDate, now);
    const Icon = ICON_MAP[event.icon] || Heart;
    const isFeature = index === 0;

    const copyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}?countdown=${event.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết sự kiện! 🗓️");
    };

    return (
        <motion.div
            key={event.id}
            id={`event-${event.id}`}
            className={`group relative glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[260px] border border-border bg-card/80 ${isFeature ? "md:col-span-2" : ""
                }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
        >
            {/* Actions Menu */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/20 hover:bg-background/40 text-muted-foreground hover:text-foreground rounded-full transition-all"
                    onClick={copyLink}
                    title="Sao chép liên kết"
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/20 hover:bg-background/40 text-muted-foreground hover:text-foreground rounded-full transition-all"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground min-w-[150px]">
                        <DropdownMenuItem onClick={() => {
                            onEdit(event as CountdownEvent, { stopPropagation: () => { } } as any);
                            setDropdownOpen(false);
                        }} className="focus:bg-muted focus:text-foreground cursor-pointer gap-2">
                            <Pencil className="w-4 h-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            onDelete(event.id);
                            setDropdownOpen(false);
                        }} className="focus:bg-destructive/20 focus:text-destructive text-destructive cursor-pointer gap-2">
                            <Trash2 className="w-4 h-4" /> Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>

                </div>
                <div>

                    <h3 className="text-xl text-foreground font-light">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        <span className="text-xs text-muted-foreground border border-primary/10 px-2.5 py-0.5 rounded-full capitalize w-fit mb-2 mr-4" >
                            {event.type}
                        </span>
                        {format(event.targetDate, "MMM d, yyyy")}
                    </p>
                </div>
            </div>

            {/* Countdown Display */}
            <div className={`relative z-10 ${isFeature ? "flex gap-8 mt-4" : "mt-6"}`}>
                {time.isToday ? (
                    <div className="w-full text-center py-4">
                        <span className="inline-block text-2xl md:text-3xl font-light text-primary text-glow font-serif animate-pulse">
                            ✨ Đang diễn ra ✨
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">
                            Hãy tận hưởng ngày đặc biệt này!
                        </p>
                    </div>
                ) : isFeature ? (
                    <>
                        <div className="text-center">
                            <span className="block text-5xl md:text-7xl font-light text-primary text-glow leading-none font-serif">
                                {time.days}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 block">
                                Ngày
                            </span>
                        </div>
                        <div className="h-auto w-px bg-primary/10" />
                        <div className="text-center">
                            <span className="block text-5xl md:text-7xl font-light text-primary/60 leading-none font-serif">
                                {time.hours}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 block">
                                Giờ
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-center bg-background/30 rounded-xl p-4 border border-primary/5">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-light text-primary text-glow font-serif">
                                {time.days}
                            </span>
                            <span className="text-lg text-primary/40">d</span>
                        </div>
                        <div className="w-full bg-primary/5 h-1 mt-3 rounded-full overflow-hidden">
                            <motion.div
                                className="bg-primary h-full shadow-[0_0_10px_rgba(var(--primary),0.6)]"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.max(5, 100 - (time.days / 365) * 100)}%`,
                                }}
                                transition={{ duration: 1, delay: 0.3 * index }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {time.days < 7 ? "Chuẩn bị nhen!" : time.days < 30 ? "Đang đến gần!" : time.days < 60 ? "Sắp tới" : time.days < 90 ? "Đợi xíu" : "Còn lâu á"}
                        </p>
                    </div>
                )}
            </div>

            {isFeature && event.description && (
                <p className="text-muted-foreground italic font-light font-serif mt-4 relative z-10">
                    &ldquo;{event.description}&rdquo;
                </p>
            )}


        </motion.div>
    );
}

export function CountdownTab({ initialEventId }: { initialEventId?: string | null }) {
    const { countdowns, addCountdown, updateCountdown, deleteCountdown } = useValentine();
    const events = countdowns.length > 0 ? countdowns : [];
    const [, setTick] = useState(0);
    const now = getVietnamDate();
    const startOfToday = startOfDay(now);

    // Process and sort events
    const processedEvents = events
        .map((event) => {
            const target = getTargetDate(event);
            return {
                ...event,
                targetDate: target,
                shouldShow: event.type !== "khác" || !isBefore(target, startOfToday), // Hide custom events if strictly in the past
            };
        })
        .filter((e) => e.shouldShow)
        .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

    const [editingCountdown, setEditingCountdown] = useState<Partial<CountdownEvent> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isGreetingConfigOpen, setIsGreetingConfigOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSave = () => {
        if (!editingCountdown?.title || !editingCountdown?.date || !editingCountdown?.type) return;

        // Sanitize payload to avoid sending derived properties like targetDate to Supabase
        const payload: Partial<CountdownEvent> = {
            title: editingCountdown.title,
            date: editingCountdown.date,
            icon: editingCountdown.icon || "heart",
            type: editingCountdown.type as CountdownEvent["type"],
            description: editingCountdown.description || "",
            // image_url is not supported in DB schema yet
        };

        if (editingCountdown.id) {
            updateCountdown(editingCountdown.id, payload);
        } else {
            addCountdown(payload as Omit<CountdownEvent, "id">);
        }
        setEditingCountdown(null);
        setIsFormOpen(false);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteCountdown(deleteId);
            setDeleteId(null);
        }
    };

    const openEdit = (countdown: CountdownEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCountdown(countdown);
        setIsFormOpen(true);
    };

    const openNew = () => {
        setEditingCountdown({
            title: "",
            date: "",
            icon: "heart",
            type: "khác",
            description: "",
        });
        setIsFormOpen(true);
    };

    // Re-render every minute for live countdown
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    // Deep Link Effect
    useEffect(() => {
        if (initialEventId) {
            const element = document.getElementById(`event-${initialEventId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-2", "ring-rose-gold", "ring-offset-4", "ring-offset-background");
                setTimeout(() => {
                    element.classList.remove("ring-2", "ring-rose-gold", "ring-offset-4", "ring-offset-background");
                }, 3000);
            }
        }
    }, [initialEventId, processedEvents]);

    const todayDateString = formatVietnamDate(undefined, "MMMM d");

    return (
        <div className="space-y-8 select-none">
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <div className="text-primary text-lg italic font-serif mb-1 min-h-7">
                        <DynamicGreeting onEdit={() => setIsGreetingConfigOpen(true)} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-light text-foreground">
                        Sự kiện sắp tới
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-3xl font-light text-primary/80 font-serif">
                        {todayDateString}
                    </p>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">
                        Hôm nay
                    </p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-border bg-card/80">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <CalendarHeart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Đang diễn ra
                        </p>
                        <p className="text-xl font-medium text-foreground">
                            {processedEvents.length} Sự kiện
                        </p>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-border bg-card/80">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Tiếp theo
                        </p>
                        <p className="text-xl font-medium text-foreground">
                            {processedEvents[0]?.title || "—"}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedEvents.map((event, i) => (
                    <CountdownCard
                        key={event.id}
                        event={event}
                        index={i}
                        now={now}
                        onEdit={openEdit}
                        onDelete={setDeleteId}
                    />
                ))}


                {/* Add New Card */}
                {/* Add New Card */}
                <motion.button
                    onClick={openNew}
                    className="group border-2 border-dashed border-primary/15 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 min-h-[260px]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-300">
                        <Plus className="w-7 h-7 text-primary group-hover:text-background transition-colors" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-light text-primary font-serif">
                            Thêm cột mốc mới
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tạo kỷ niệm mới để cùng mong chờ
                        </p>
                    </div>
                </motion.button>
            </div>
            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-surface border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center font-serif italic text-2xl text-primary">
                            {editingCountdown?.id ? "Chỉnh sửa cột mốc" : "Thêm cột mốc"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Tên</label>
                            <Input
                                value={editingCountdown?.title || ""}
                                onChange={(e) =>
                                    setEditingCountdown((prev) => prev ? ({ ...prev, title: e.target.value }) : null)
                                }
                                placeholder="Ví dụ: Kỷ niệm sinh nhật"
                                className="bg-muted border-primary/10 text-foreground"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Ngày</label>
                                <Input
                                    type="date"
                                    value={editingCountdown?.date || ""}
                                    onChange={(e) =>
                                        setEditingCountdown((prev) => prev ? ({ ...prev, date: e.target.value }) : null)
                                    }
                                    className="bg-muted border-primary/10 text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Loại</label>
                                <select
                                    value={editingCountdown?.type || "khác"}
                                    onChange={(e) =>
                                        setEditingCountdown((prev) => prev ? ({ ...prev, type: e.target.value as CountdownEvent["type"] }) : null)
                                    }
                                    className="w-full h-10 rounded-md bg-muted border border-primary/10 text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {TYPES.map((t) => (
                                        <option key={t} value={t} className="bg-surface text-foreground">
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(({ name, icon: Icon }) => (
                                    <button
                                        key={name}
                                        onClick={() =>
                                            setEditingCountdown((prev) => prev ? ({ ...prev, icon: name }) : null)
                                        }
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            editingCountdown?.icon === name
                                                ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm text-muted-foreground">Mô tả (Tùy chọn)</label>
                            <Input
                                value={editingCountdown?.description || ""}
                                onChange={(e) =>
                                    setEditingCountdown((prev) => prev ? ({ ...prev, description: e.target.value }) : null)
                                }
                                placeholder="Mô tả..."
                                className="bg-muted border-primary/10 text-foreground"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Lưu cột mốc
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="bg-surface border-border text-foreground max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center font-serif italic text-xl">
                            Xóa cột mốc
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-muted-foreground py-4">
                        Bạn có chắc chắn muốn xóa cột mốc này?
                        <br />
                        Hành động này không thể được hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteId(null)}
                            className="hover:bg-muted"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <GreetingConfigDialog open={isGreetingConfigOpen} onOpenChange={setIsGreetingConfigOpen} />
        </div>
    );
}

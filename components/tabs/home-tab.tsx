import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MapPin,
    Lock,
    Send,
    Image as ImageIcon,
    ChevronDown,
    X,
    Download,
    Link as LinkIcon,
    MessageCircle, // Added
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { downloadImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays, format } from "date-fns";
import { useUpload } from "@/hooks/use-upload";
import { getVietnamDate } from "@/lib/date-utils";
import { useValentine } from "@/providers/valentine-provider";
import { usePostComments } from "@/lib/store"; // Added by user instruction
import { EventManager } from "@/components/events/event-manager"; // Added by user instruction

import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useValentineAuth, useValentineData } from "@/providers/valentine-provider";
import React, { memo, useEffect } from "react";

const HistoryItem = memo(({
    date,
    myNote,
    partnerNote,
    partnerName
}: {
    date: string,
    myNote: any,
    partnerNote: any,
    partnerName: string
}) => {
    return (
        <motion.div
            className="glass-card rounded-xl p-6 border border-border bg-card/80"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <span className="text-primary font-serif">
                        {format(new Date(date), "dd/MM/yyyy")}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}${window.location.pathname}?caption=${date}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Đã sao chép liên kết kỷ niệm! ❤️");
                        }}
                        title="Sao chép liên kết"
                    >
                        <LinkIcon className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/?tab=chat&chat_type=caption&chat_ref=${date}`;
                        }}
                        title="Chat về ngày này"
                    >
                        <MessageCircle className="w-3 h-3" />
                    </Button>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    Nhật ký
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <p className="text-xs text-primary/50 uppercase tracking-widest">Bạn</p>
                    <p className="text-foreground/80 font-serif italic text-sm leading-relaxed">
                        {myNote?.content}
                    </p>
                    {myNote?.media_url && (
                        <ImageWithZoom
                            src={myNote.media_url}
                            alt="Your memory"
                        />
                    )}
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <p className="text-xs text-primary/50 uppercase tracking-widest">{partnerName}</p>
                    {partnerNote ? (
                        <>
                            <p className="text-foreground/80 font-serif italic text-sm leading-relaxed">
                                {partnerNote.content}
                            </p>
                            {partnerNote.media_url && (
                                <ImageWithZoom
                                    src={partnerNote.media_url}
                                    alt="Partner memory"
                                />
                            )}
                        </>
                    ) : (
                        <p className="text-muted-foreground italic text-sm">
                            Không có nhật ký ngày này.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

HistoryItem.displayName = "HistoryItem";

export function HomeTab({ initialCaptionDate }: { initialCaptionDate?: string | null }) {
    const {
        role: currentRole,
        partnerName,
        profiles
    } = useValentineAuth();

    const {
        startDate,
        myCaption,
        partnerCaption,
        hasWrittenToday,
        captions,
        onSubmitCaption,
    } = useValentineData();

    const [captionText, setCaptionText] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
    const { uploadFile, isUploading } = useUpload();

    // History State
    const [historyLimit, setHistoryLimit] = useState(5);

    const today = useMemo(() => getVietnamDate(), []);
    const todayStr = format(today, "yyyy-MM-dd");

    const daysTogether = useMemo(
        () => differenceInDays(today, getVietnamDate(startDate)),
        [startDate, today]
    );

    // History Logic:
    // Get all dates where CURRENT USER has written a note.
    const history = useMemo(() => {
        console.log("HomeTab - Computing history. Current User:", currentRole);
        console.log("HomeTab - Captions:", captions);

        const dates = Object.keys(captions)
            .filter((date) => {
                const userHasNote = !!captions[date]?.[currentRole];
                // Debug log for each date check
                // console.log(`Date: ${date}, HasNote: ${userHasNote}, IsToday: ${date === todayStr}`);
                return userHasNote && date !== todayStr;
            })
            .sort((a, b) => getVietnamDate(b).getTime() - getVietnamDate(a).getTime());

        console.log("HomeTab - Computed History Dates:", dates);
        return dates;
    }, [captions, currentRole, todayStr]);

    const visibleHistory = history.slice(0, historyLimit);
    const hasMoreHistory = history.length > historyLimit;

    // Deep Link Effect: If initialCaptionDate is provided, make sure it's in history and expand limit if needed
    useEffect(() => {
        if (initialCaptionDate) {
            const index = history.indexOf(initialCaptionDate);
            if (index !== -1 && index >= historyLimit) {
                setHistoryLimit(index + 1);
            }
        }
    }, [initialCaptionDate, history, historyLimit]);

    const handleSubmit = () => {
        if (!captionText.trim()) return;
        onSubmitCaption(captionText.trim(), uploadedMedia);
        setCaptionText("");
        setUploadedMedia(null);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const url = await uploadFile(file);
            if (url) {
                setUploadedMedia(url);
            }
        }
    };

    return (
        <div className="space-y-16 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4 col-span-1">
                    {/* Hero: Days Counter */}
                    <motion.div
                        className="text-center space-y-2 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-primary/70 text-sm tracking-[0.3em] uppercase italic font-serif">
                            Đã bên nhau
                        </p>
                        <div className="flex items-baseline justify-center gap-3">
                            <motion.span
                                className="text-7xl md:text-8xl font-serif text-foreground font-light text-glow"
                                key={daysTogether}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {daysTogether.toLocaleString()}
                            </motion.span>
                            <span className="text-3xl md:text-4xl text-primary/60 font-serif italic">
                                Ngày
                            </span>
                        </div>
                    </motion.div>

                    {/* Couple Photo */}
                    <motion.div
                        className="relative w-full max-w-sm mx-auto aspect-3/4 rounded-xl overflow-hidden border border-rose-gold/10 shadow-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <Image
                            src="https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/IMG_1364.jpg"
                            alt="Couple"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-serif italic">Hành trình của chúng mình</span>
                        </div>
                    </motion.div>
                </div>

                {/* Daily Note Section */}
                <motion.div
                    className="space-y-4 col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex flex-col items-start justify-between">
                        <span className="mb-2 text-primary/50 text-sm border border-primary/10 px-3 py-1 rounded-full font-serif">
                            {format(today, "MMMM d, yyyy")}
                        </span>
                        <h2 className="text-2xl  font-serif italic text-foreground">Nhật ký hôm nay</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {/* Your Note */}
                        <div className="glass-card rounded-xl p-6 space-y-4 border border-border bg-card/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-foreground font-medium">
                                        {hasWrittenToday ? "Note của bạn" : "Đến lượt bạn"}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {hasWrittenToday
                                            ? "Đã chia sẻ hôm nay"
                                            : `Chia sẻ suy nghĩ của bạn để mở khóa ${currentRole === "ẻm" ? "của ảnh" : "của ẻm"}.`}
                                    </p>
                                </div>
                            </div>

                            {hasWrittenToday ? (
                                <div className="space-y-3">
                                    <div className="bg-background/30 rounded-lg p-4 border border-primary/5">
                                        <p className="text-foreground/70 font-serif italic">{myCaption}</p>
                                    </div>
                                    {/* Display uploaded media if exists (Need to check if myCaption logic handles media_url display or if we need to fetch it from captions prop. 
                                        Since myCaption prop is just string, we might need to look it up in captions prop or rely on optimized update. 
                                        Actually captions prop has it. Let's look up.
                                    */}
                                    {captions[todayStr]?.[currentRole]?.media_url && (
                                        <ImageWithZoom
                                            src={captions[todayStr][currentRole].media_url!}
                                            alt="Attachment"
                                        />
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Textarea
                                        placeholder={`Hôm nay của ${currentRole} thế nào?`}
                                        value={captionText}
                                        onChange={(e) => setCaptionText(e.target.value)}
                                        className="bg-background/30 border-primary/10 min-h-[100px] resize-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 font-serif"
                                    />

                                    {/* Image Preview */}
                                    {uploadedMedia && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-primary/10 group">
                                            <Image src={uploadedMedia} alt="Uploaded" fill className="object-cover" />
                                            <button
                                                onClick={() => setUploadedMedia(null)}
                                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                onChange={handleFileSelect}
                                                disabled={isUploading}
                                            />
                                            <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5" />
                                                {isUploading && <span className="text-xs animate-pulse">Đang tải lên...</span>}
                                            </button>
                                        </div>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!captionText.trim() || isUploading}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif disabled:opacity-30"
                                        >
                                            {isUploading ? "Đang tải lên..." : "Chia sẻ"}
                                            {!isUploading && <Send className="w-4 h-4 ml-2" />}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Partner's Note */}
                        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden border border-border bg-card/80">
                            {hasWrittenToday && partnerCaption ? (
                                <motion.div
                                    className="text-center space-y-4 p-4 w-full"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <p className="text-foreground/70 font-serif italic text-lg">
                                        &ldquo;{partnerCaption}&rdquo;
                                    </p>
                                    {captions[todayStr]?.[currentRole === "ảnh" ? "ẻm" : "ảnh"]?.media_url && (
                                        <div className="w-full max-w-xs mx-auto">
                                            <ImageWithZoom
                                                src={captions[todayStr][currentRole === "ảnh" ? "ẻm" : "ảnh"].media_url!}
                                                alt="Attachment"
                                            />
                                        </div>
                                    )}
                                    <p className="text-primary/40 text-sm">
                                        — {partnerName}
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                        <Lock className="w-6 h-6 text-primary/50" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-medium">
                                            Nhật ký của {partnerName} đang khóa
                                        </p>
                                        <p className="text-muted-foreground text-sm mt-1 max-w-[240px]">
                                            {hasWrittenToday
                                                ? `Đang chờ ${partnerName} chia sẻ...`
                                                : `Chia sẻ khoảnh khắc của bạn để xem ${partnerName} viết gì hôm nay.`}
                                        </p>
                                    </div>
                                    {/* <div className="flex items-center gap-2 text-primary/40 text-xs tracking-widest uppercase">
                                        <span className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
                                        Chờ bạn chia sẻ
                                    </div> */}
                                </div>
                            )}

                            {/* Blur overlay when locked */}
                            {!hasWrittenToday && partnerCaption && (
                                <div className="absolute inset-0 backdrop-blur-lg bg-surface/50 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-rose-gold/30" />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* History Section */}
            {visibleHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-2xl mx-auto space-y-6 pb-20"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                        <h3 className="text-xl font-serif italic text-muted-foreground">Kỷ niệm xưa</h3>
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
                    </div>

                    <div className="space-y-6">
                        {visibleHistory.map((date) => {
                            const myNote = captions[date]?.[currentRole];
                            const partnerRoleKey = currentRole === "ảnh" ? "ẻm" : "ảnh";
                            const partnerNote = captions[date]?.[partnerRoleKey];

                            return (
                                <HistoryItem
                                    key={date}
                                    date={date}
                                    myNote={myNote}
                                    partnerNote={partnerNote}
                                    partnerName={partnerName}
                                />
                            );
                        })}
                    </div>

                    {hasMoreHistory && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setHistoryLimit(prev => prev + 5)}
                                className="text-muted-foreground hover:text-primary hover:bg-transparent"
                            >
                                Xem thêm
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </motion.div>
            )}
        </div >
    );
}

function ImageWithZoom({ src, alt }: { src: string; alt: string }) {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        downloadImage(src, `valentine-memory-${Date.now()}.jpg`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="relative aspect-auto max-h-48 rounded-lg overflow-hidden cursor-zoom-in border border-border group mt-2">
                    <Image
                        src={src}
                        alt={alt}
                        width={400}
                        height={300}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-3xl p-0 bg-transparent border-none">
                <div className="relative w-full aspect-auto flex items-center justify-center">
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    />
                    <button
                        onClick={handleDownload}
                        className="absolute top-4 right-12 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                        title="Tải ảnh"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

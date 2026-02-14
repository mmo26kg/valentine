"use client";

import { useState } from "react";
import { useEvents } from "@/lib/store";
import { SpecialEvent } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";

export function EventManager() {
    const { events, addEvent, updateEvent, deleteEvent } = useEvents();
    const [editingEvent, setEditingEvent] = useState<Partial<SpecialEvent> | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSave = () => {
        if (!editingEvent?.title || !editingEvent?.date || !editingEvent?.message || !editingEvent?.icon) return;

        if (editingEvent.id) {
            updateEvent(editingEvent.id, editingEvent);
        } else {
            addEvent(editingEvent as Omit<SpecialEvent, "id">);
        }
        setIsFormOpen(false);
        setEditingEvent(null);
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteEvent(deleteId);
            setDeleteId(null);
        }
    };

    const openCreate = () => {
        setEditingEvent({
            title: "",
            date: "",
            message: "",
            icon: "🎉",
        });
        setIsFormOpen(true);
    };

    const openEdit = (event: SpecialEvent) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif italic text-white">Danh sách sự kiện</h3>
                <Button onClick={openCreate} size="sm" className="bg-rose-gold text-background hover:bg-rose-gold-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sự kiện
                </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start gap-4"
                    >
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
                                {event.icon}
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{event.title}</h4>
                                <div className="flex items-center gap-2 text-rose-gold/70 text-sm mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{event.date}</span>
                                </div>
                                <p className="text-white/50 text-sm mt-2 line-clamp-2">{event.message}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(event)}
                                className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(event.id)}
                                className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <p className="text-center text-white/30 py-8 italic">Chưa có sự kiện nào</p>
                )}
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-surface border-rose-gold/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center font-serif italic text-2xl">
                            {editingEvent?.id ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label>Tiêu đề</Label>
                            <Input
                                value={editingEvent?.title || ""}
                                onChange={(e) => setEditingEvent(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ví dụ: Happy Valentine's Day"
                                className="bg-background border-rose-gold/10 text-white mt-1.5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Ngày (MM-DD)</Label>
                                <Input
                                    value={editingEvent?.date || ""}
                                    onChange={(e) => setEditingEvent(prev => ({ ...prev, date: e.target.value }))}
                                    placeholder="02-14"
                                    className="bg-background border-rose-gold/10 text-white mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Icon (Emoji)</Label>
                                <Input
                                    value={editingEvent?.icon || ""}
                                    onChange={(e) => setEditingEvent(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="💕"
                                    className="bg-background border-rose-gold/10 text-white mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Lời nhắn</Label>
                            <Textarea
                                value={editingEvent?.message || ""}
                                onChange={(e) => setEditingEvent(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Nhập lời chúc..."
                                className="bg-background border-rose-gold/10 text-white mt-1.5 min-h-[100px]"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            className="w-full bg-rose-gold hover:bg-rose-gold-dark text-background font-serif mt-2"
                        >
                            {editingEvent?.id ? "Lưu thay đổi" : "Tạo sự kiện"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="bg-surface border-rose-gold/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center font-serif italic text-xl">
                            Xác nhận xóa
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-white/70 py-4">
                        Bạn có chắc chắn muốn xóa sự kiện này không?
                        <br />
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteId(null)}
                            className="hover:bg-white/10 hover:text-white"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-500/80 hover:bg-red-500"
                        >
                            Xóa
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

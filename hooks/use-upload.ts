import { useState } from "react";
import { toast } from "sonner";

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

export function useUpload() {
    const [state, setState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
    });

    const uploadFile = async (file: File): Promise<string | null> => {
        setState({ isUploading: true, progress: 0, error: null });

        const uploadPromise = (async () => {
            let fileToUpload = file;
            const { convertHeicToJpg } = await import("@/lib/file-utils");
            fileToUpload = await convertHeicToJpg(file);

            const formData = new FormData();
            formData.append("file", fileToUpload);

            // Use the proxy upload route
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await res.json();
            return data.publicUrl;
        })();

        toast.promise(uploadPromise, {
            loading: 'Đang tải hình ảnh lên...',
            success: 'Tải hình ảnh thành công!',
            error: 'Lỗi tải hình ảnh',
        });

        try {
            const publicUrl = await uploadPromise;
            setState({ isUploading: false, progress: 100, error: null });
            return publicUrl;
        } catch (error) {
            console.error("Upload error:", error);
            const message = error instanceof Error ? error.message : "Upload failed";
            setState({ isUploading: false, progress: 0, error: message });
            return null;
        }
    };

    return {
        isUploading: state.isUploading,
        progress: state.progress,
        error: state.error,
        uploadFile,
    };
}

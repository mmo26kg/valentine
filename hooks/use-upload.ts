import { useState } from "react";
// import { toast } from "sonner"; 

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

        try {
            const formData = new FormData();
            formData.append("file", file);

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

            setState({ isUploading: false, progress: 100, error: null });
            return data.publicUrl;
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

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
            let fileToUpload = file;

            // Check for HEIC/HEIF files
            // mimetype for heic can be "image/heic" or empty string with .heic extension
            const isHeic = file.type === "image/heic" ||
                file.type === "image/heif" ||
                file.name.toLowerCase().endsWith(".heic") ||
                file.name.toLowerCase().endsWith(".heif");

            if (isHeic) {
                console.log("Converting HEIC file...");
                try {
                    // Dynamically import to avoid SSR issues if this hook is ever used in a way that triggers it
                    const heic2any = (await import("heic2any")).default;

                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8
                    });

                    // heic2any can return a Blob or Blob[]
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

                    // Create a new File object
                    const newFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
                    fileToUpload = new File([blob], newFileName, { type: "image/jpeg" });

                    console.log("Conversion complete:", fileToUpload.name);
                } catch (convError) {
                    console.error("HEIC conversion failed:", convError);
                    // Fallback to original file or throw? 
                    // If server doesn't support HEIC, it might be better to let it fail there or warn user.
                    // For now, let's try uploading original but log error
                }
            }

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

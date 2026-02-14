
/**
 * Utility to convert HEIC/HEIF files to JPG.
 * Required 'heic2any' package.
 */
export async function convertHeicToJpg(file: File): Promise<File> {
    // Check for HEIC/HEIF files
    // mimetype for heic can be "image/heic" or empty string with .heic extension
    const isHeic = file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

    if (!isHeic) return file;

    try {
        console.log(`Converting ${file.name} from HEIC to JPG...`);
        // Dynamically import to avoid SSR issues
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
        const newFile = new File([blob], newFileName, { type: "image/jpeg" });

        console.log("Conversion complete:", newFile.name);
        return newFile;
    } catch (error) {
        console.error("HEIC conversion failed:", error);
        // Fallback to original file if conversion fails
        return file;
    }
}

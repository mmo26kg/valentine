import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileUrls } = body;

        if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
            return NextResponse.json(
                { error: "No file URLs provided" },
                { status: 400 }
            );
        }

        const bucketName = process.env.R2_BUCKET_NAME;
        if (!bucketName) {
            return NextResponse.json(
                { error: "Server configuration error: Missing bucket name" },
                { status: 500 }
            );
        }

        // Extract keys from URLs
        // URL format: https://<custom_domain>/<key>
        // We need to extract <key>
        // Example: https://pub-[...].r2.dev/media/filename.jpg -> media/filename.jpg

        const objectsToDelete = fileUrls.map((url: string) => {
            try {
                const urlObj = new URL(url);
                // Remove leading slash
                return { Key: urlObj.pathname.substring(1) };
            } catch {
                // If url is invalid, maybe it's just a path or key?
                // But we assume full URL from DB.
                return { Key: url };
            }
        }).filter(obj => obj.Key !== "");

        if (objectsToDelete.length === 0) {
            return NextResponse.json({ success: true, deleted: 0 });
        }

        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: objectsToDelete,
                Quiet: false,
            },
        });

        const response = await r2.send(command);

        if (response.Errors && response.Errors.length > 0) {
            console.error("R2 Delete Errors:", response.Errors);
            // We can return partial success or error
        }

        return NextResponse.json({
            success: true,
            deleted: response.Deleted?.length || 0,
            errors: response.Errors
        });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete files" },
            { status: 500 }
        );
    }
}

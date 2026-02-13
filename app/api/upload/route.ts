import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

// Next.js App Router allows increasing body size limit
// however, Vercel/similar might still have hard limits (4.5MB).
// For a personal project or VPS, checking config is key.
export const config = {
    api: {
        bodyParser: false, // We handle parsing via formData
    },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

        if (!bucketName) {
            return NextResponse.json(
                { error: "Server configuration error: Missing bucket name" },
                { status: 500 }
            );
        }

        // Generate a unique key
        const uniqueParams = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        // Sanitize filename
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `media/${uniqueParams}-${sanitizedFilename}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2 directly from server
        await r2.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        return NextResponse.json({
            success: true,
            publicUrl: `${publicUrlBase}/${key}`,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export async function GET() {
    try {
        const bucketName = process.env.R2_BUCKET_NAME;

        if (!bucketName) {
            return NextResponse.json({ error: "Bucket name missing" }, { status: 500 });
        }

        const command = new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                        AllowedOrigins: ["*"], // Allow all for development, restrict in prod if needed
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: 3000,
                    },
                ],
            },
        });

        await r2.send(command);

        return NextResponse.json({ success: true, message: "CORS configured successfully" });
    } catch (error) {
        console.error("CORS Fix Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}

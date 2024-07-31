import * as Minio from "minio";
import { Readable } from "stream";

export const minioClient = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT || "",
    port: parseInt(process.env.S3_PORT || "9001"),
    useSSL: process.env.S3_USE_SSL === "true",
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
});

export async function uploadFile(fileName: string, sourceFile: File) {
    const bucket = process.env.S3_BUCKET_NAME || "";

    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
        await minioClient.makeBucket(bucket);
    }

    const fileBuffer = Buffer.from(await sourceFile.arrayBuffer());
    await minioClient.putObject(bucket, fileName, fileBuffer);
}

export async function getFile(fileName: string) {
    const bucket = process.env.S3_BUCKET_NAME || "";

    try {
        const file = await minioClient.getObject(bucket, fileName);
        const buffer = await streamToBuffer(file);
        return buffer;
    } catch (error) {
        if ((error as Minio.S3Error).code === "NoSuchKey") {
            return null;
        }

        console.error(error);
    }
}

// source: https://medium.com/@akhilanand.ak01/745fc2f77728
async function streamToBuffer(readableStream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        readableStream.on('data', data => {
            if (typeof data === 'string') {
                chunks.push(Buffer.from(data, 'utf-8'));
            } else if (data instanceof Buffer) {
                chunks.push(data);
            } else {
                const jsonData = JSON.stringify(data);
                chunks.push(Buffer.from(jsonData, 'utf-8'));
            }
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}
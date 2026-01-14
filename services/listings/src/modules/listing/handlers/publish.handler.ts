import { FastifyRequest, FastifyReply } from "fastify";
import { PublishListingSchema } from "../listing.schema";
import { ZodError } from "zod";
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { ListingService } from "../listing.service";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEST_SELLER_ID = 'sylvio-rand-id'; // Temporaire pour l'étape 1

export async function handlePublish(request: FastifyRequest, reply: FastifyReply) {
    const uploadedFiles: string[] = [];

    try {
        const { listingData, files: photos } = await processMultipart(request, uploadedFiles);

        const validatedData = PublishListingSchema.parse(listingData);
        console.log("validatedData", validatedData);

        const result = await ListingService.createListing(validatedData, photos, TEST_SELLER_ID);

        return reply.status(201).send({
            listingId: result.id,
            status: result.status,
            message: 'listing.publish_success',
            data: result
        });

    } catch (error) {
        cleanupFiles(uploadedFiles);
        return handleError(error, reply);
    }
}

async function processMultipart(request: FastifyRequest, uploadedFiles: string[]) {
    const parts = request.parts();
    let listingData: any = null;

    for await (const part of parts) {
        if (part.type === 'field' && part.fieldname === 'data') {
            if (listingData) throw new Error('validation.duplicate_data_field');
            listingData = JSON.parse(part.value as string);
        }

        if (part.type === 'file' && part.fieldname === 'files') {
            validateMimeType(part.mimetype);

            if (!fs.existsSync(UPLOAD_DIR)) {
                fs.mkdirSync(UPLOAD_DIR, { recursive: true });
            }

            const filepath = path.join(UPLOAD_DIR, `${Date.now()}-${part.filename}`);
            await pipeline(part.file, fs.createWriteStream(filepath));
            uploadedFiles.push(filepath);
        }
    }

    if (!listingData) throw new Error('validation.listing.data_required');
    if (uploadedFiles.length < 3) throw new Error('validation.listing.photos.min_count');
    if (uploadedFiles.length > 10) throw new Error('validation.listing.photos.max_count');

    return { listingData, files: uploadedFiles };
}

function validateMimeType(mimetype: string) {
    if (!ALLOWED_MIMES.includes(mimetype)) {
        throw new Error('validation.file.invalid_format');
    }
}

function cleanupFiles(files: string[]) {
    files.forEach(f => {
        try { fs.unlinkSync(f); } catch { }
    });
}

function handleError(error: any, reply: FastifyReply) {
    console.error("❌ Publish Error:", error);

    // Erreurs de validation Zod
    if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};

        // Supporte anciennes et nouvelles versions de Zod
        const zodIssues = (error as any).errors || (error as any).issues;

        if (Array.isArray(zodIssues)) {
            zodIssues.forEach((err: any) => {
                const field = err.path.join('.');
                if (!details[field]) details[field] = [];
                details[field].push(`validation.listing.${field}.${err.code}`);
            });
        }

        return reply.status(400).send({ details });
    }

    // Erreurs spécifiques
    if (error.message === 'validation.listing.data_required') {
        return reply.status(400).send({
            details: { data: ['validation.listing.data_required'] }
        });
    }

    if (error.message === 'validation.listing.photos.min_count') {
        return reply.status(400).send({
            details: { photos: ['validation.listing.photos.min_count'] }
        });
    }

    if (error.message === 'validation.listing.photos.max_count') {
        return reply.status(400).send({
            details: { photos: ['validation.listing.photos.max_count'] }
        });
    }

    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({
            error: "file_too_large",
            message: "validation.file.too_large"
        });
    }

    // Erreur générique
    return reply.status(400).send({
        error: error.message || 'validation.unknown_error'
    });
}
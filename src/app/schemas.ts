import { z } from "zod";

export const fileInfoSchema = z.object({
	title: z.string().min(1).max(1024),
	size: z.number().positive(),
	type: z.string().max(1024),
});

export const fileDownloadSchema = z.object({
	id: z.string().min(1).max(1024),
	fileName: z.string().min(1).max(1024),
});

export const storeTextSchema = z.object({
	text: z.string().min(1).max(parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)),
});

export const readTextSchema = z.object({
	textId: z.string().min(1),
});

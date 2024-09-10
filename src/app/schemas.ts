import { z } from "zod";

export const fileInfoSchema = z.object({
	title: z.string().min(1).max(1024),
	size: z.number().positive(),
	type: z.string().max(1024),
});

export const storeTextSchema = z.object({
	text: z
		.string()
		.min(0, `Text is too short. It should include at least 1 character.`)
		.max(
			parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!),
			`Text is too long. Make sure it contains fewer than ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGT} characters`
		),
});

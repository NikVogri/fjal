import { z } from "zod";

export const fileInfoSchema = z.object({
	title: z.string().min(1).max(1024),
	size: z.number().positive(),
	type: z.string().max(1024),
});

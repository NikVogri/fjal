import { z } from "zod";
import { formatFileSize } from "./helpers/file-size";

export const fileInfoSchema = z.object({
	fileName: z
		.string({ message: "Title is required" })
		.min(1, { message: "Title should a be at least one character long" })
		.max(1024, { message: "Title should a be maximum of 1024 characters long" }),
	fileSize: z
		.number({ message: "Size is required" })
		.positive()
		.max(parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!), {
			message: `File size is too large! Please make sure the file is under ${formatFileSize(
				parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)
			)}!`,
		}),
	fileType: z
		.string({ message: "Type is required" })
		.max(1024, { message: "Type should a be maximum of 1024 characters long" }),
});

export const fileDownloadSchema = z.object({
	id: z.string().min(1).max(1024),
	fileName: z.string().min(1).max(1024),
});

export const storeTextSchema = z.object({
	text: z
		.string({ message: "Text is missing." })
		.trim()
		.min(1, { message: "Text must be at least 1 character long." })
		.max(parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!), {
			message: `Text must be shorter than ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH} characters.`,
		}),
});

export const readTextSchema = z.object({
	textId: z.string().min(1),
});

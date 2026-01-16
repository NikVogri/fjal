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
				parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!),
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
		// 1500 is the approx. max length when combining salt, iv and encrypted text concatenated string.
		.max(1500, {
			message: `Text must be shorter than ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH} characters.`,
		}),
	clientSideEncryption: z.boolean(),
	clientKeyHash: z.string().optional(),
});

const textPasswordSchema = z
	.string({ message: "Password is missing." })
	.trim()
	.max(parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_PASSWORD_LENGTH!), {
		message: `Password can have a maximum of ${process.env.NEXT_PUBLIC_MAX_TEXT_PASSWORD_LENGTH} characters.`,
	});

export const storeTextFormSchema = z
	.object({
		password: textPasswordSchema.optional(),
		clientSideEncryption: z.boolean(),
		text: z
			.string({ message: "Text is missing." })
			.trim()
			.min(1, { message: "Text must be at least 1 character long." })
			.max(parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!), {
				message: `Text must be shorter than ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH} characters.`,
			}),
	})
	.refine(
		(data) => {
			if (data.clientSideEncryption && !data.password) {
				return false;
			}

			return true;
		},
		{ message: "Password is required when using client-side encryption." },
	);

export const readTextSchema = z
	.object({
		textId: z.string().min(1),
		clientSideEncryption: z.boolean(),
		password: textPasswordSchema.optional(), // FE only
		clientKeyHash: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.clientSideEncryption && !data.password && !data.clientKeyHash) {
				return false;
			}

			return true;
		},
		{ message: "Password is required for reading client-side encrypted text." },
	);

"use server";

import { ulid } from "ulid";
import { encrypt, generateIv } from "../helpers/encryption";
import db from "@/core/db";
import { checkRateLimitByIp } from "../helpers/check-ratelimit";
import { headers } from "next/headers";
import { z } from "zod";

const storeTextSchema = z.object({
	text: z
		.string({ message: "Text is missing" })
		.trim()
		.min(1, { message: "Text should be at least 1 character long" })
		.max(parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!), {
			message: "Text should be maximum ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!} characters long",
		}),
});

export interface StoreTextFormState {
	isError: boolean;
	errors: {
		text?: string[];
		other?: string[];
	};
	data?: {
		id: string;
	};
}

export async function storeText(_: StoreTextFormState, fd: FormData): Promise<StoreTextFormState> {
	const ratelimitResponse = await checkRateLimitByIp({
		ip: headers().get("x-forwarded-for")!,
		type: "text",
		action: "upload",
	});
	if (ratelimitResponse.isError) {
		return {
			isError: true,
			errors: {
				other: ["You've created too many texts for today. Please try again tomorrow."],
			},
		};
	}

	const { success, data, error } = storeTextSchema.safeParse(Object.fromEntries(fd));
	if (!success) {
		return {
			isError: true,
			errors: {
				text: error.flatten().fieldErrors.text,
			},
		};
	}

	const iv = generateIv();
	const encryptedText = encrypt(data.text, iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);

	const id = ulid();

	await db.text.create({
		data: {
			id: id,
			length: data.text.length,
			text: encryptedText,
			iv: iv.toString("hex"),
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	});

	return {
		isError: false,
		errors: {},
		data: {
			id,
		},
	};
}

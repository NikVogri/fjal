"use server";
import { ServerActionResponse } from "@/models";
import db from "@/core/db";
import { decrypt } from "@/app/helpers/encryption";
import { checkRateLimitByIp } from "@/app/helpers/check-ratelimit";
import { headers } from "next/headers";
import { z } from "zod";
import { readTextSchema } from "@/app/schemas";

export async function viewText(payload: z.infer<typeof readTextSchema>): Promise<ServerActionResponse> {
	const ratelimitResponse = await checkRateLimitByIp({
		ip: headers().get("x-forwarded-for")!,
		type: "text",
		action: "download",
	});
	if (ratelimitResponse.isError) return ratelimitResponse;

	const { success, data } = readTextSchema.safeParse(payload);
	if (!success) {
		return {
			isError: true,
			data: "Invalid or missing data.",
		};
	}

	const text = await db.text.findFirst({
		where: {
			id: data.textId,
			expiresAt: {
				gt: new Date(),
			},
		},
	});

	if (!text) {
		return {
			data: "File not found.",
			isError: true,
		};
	}

	let decryptedText;
	try {
		decryptedText = decrypt(text.text, text.iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);
	} catch (error) {
		console.error(error);

		return {
			data: "Something went wrong. Please try again later.",
			isError: true,
		};
	}

	await db.text.update({
		where: {
			id: data.textId,
		},
		data: {
			expiresAt: new Date(),
		},
	});

	return {
		data: decryptedText,
		isError: false,
	};
}

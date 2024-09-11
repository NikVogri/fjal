"use server";
import { ServerActionResponse } from "@/models";
import db from "@/core/db";
import { decrypt } from "@/app/helpers/encryption";
import { checkRateLimitByIp } from "@/app/helpers/check-ratelimit";
import { headers } from "next/headers";

export async function viewText(textId: string): Promise<ServerActionResponse> {
	const ratelimitResponse = await checkRateLimitByIp({
		ip: headers().get("x-forwarded-for")!,
		type: "text",
		action: "download",
	});
	if (ratelimitResponse.isError) return ratelimitResponse;

	const text = await db.text.findFirst({
		where: {
			id: textId,
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

	let decryptedText = decrypt(text.text, text.iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);

	try {
		decryptedText = decrypt(text.text, text.iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);
	} catch (error) {
		console.error(error);

		return {
			data: "Error during decryption. Please try again later.",
			isError: true,
		};
	}

	await db.text.update({
		where: {
			id: textId,
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

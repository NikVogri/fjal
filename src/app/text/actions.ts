"use server";

import { ulid } from "ulid";
import { encrypt, generateIv } from "../helpers/encryption";
import { storeTextSchema } from "../schemas";
import db from "@/core/db";
import { ServerActionResponse } from "@/models";
import { checkRateLimitByIp } from "../helpers/check-ratelimit";
import { headers } from "next/headers";

export async function storeText(payload: { text: string }): Promise<ServerActionResponse> {
	const ratelimitResponse = await checkRateLimitByIp({
		ip: headers().get("x-forwarded-for")!,
		type: "text",
		action: "upload",
	});
	if (ratelimitResponse.isError) return ratelimitResponse;

	const { success, data } = storeTextSchema.safeParse(payload);
	if (!success) {
		return {
			data: "Invalid or missing data",
			isError: true,
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
		data: id,
		isError: false,
	};
}

"use server";

import { ulid } from "ulid";
import { encrypt, generateIv } from "../helpers/encryption";
import db from "@/core/db";
import { checkRateLimitByIp } from "../helpers/check-ratelimit";
import { headers } from "next/headers";
import { actionClient, ActionError } from "@/core/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { storeTextSchema } from "../schemas";

export const storeText = actionClient
	.schema(storeTextSchema, {
		handleValidationErrorsShape: (ve) => flattenValidationErrors(ve).fieldErrors,
	})
	.use(async ({ next }) => {
		const ratelimitResponse = await checkRateLimitByIp({
			ip: headers().get("x-forwarded-for")!,
			type: "text",
			action: "upload",
		});

		if (ratelimitResponse.isError) {
			throw new ActionError(ratelimitResponse.data);
		}

		return next();
	})
	.action(async ({ parsedInput: { text } }) => {
		const iv = generateIv();
		const encryptedText = encrypt(text, iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);

		const id = ulid();

		await db.text.create({
			data: {
				id: id,
				length: text.length,
				text: encryptedText,
				iv: iv.toString("hex"),
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});

		return {
			id,
		};
	});

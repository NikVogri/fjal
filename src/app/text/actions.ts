"use server";

import { encrypt, generateIv } from "../helpers/crypto";
import db from "@/core/db";
import { checkRateLimitByIp } from "../helpers/check-ratelimit";
import { headers } from "next/headers";
import { actionClient, ActionError } from "@/core/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { storeTextSchema } from "../schemas";
import { generateSimpleId } from "../helpers/id";

export const storeText = actionClient
	.schema(storeTextSchema, {
		handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
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
	.action(async ({ parsedInput: { text, clientSideEncryption } }) => {
		const iv = generateIv();

		let encryptedText: string;
		if (clientSideEncryption) {
			encryptedText = text; // no need to encrypt, it's already encrypted
		} else {
			encryptedText = encrypt(text, iv, process.env.TEXT_ENCRYPTION_SECRET_KEY!);
		}

		const id = generateSimpleId();

		await db.text.create({
			data: {
				id: id,
				length: text.length,
				text: encryptedText,
				iv: clientSideEncryption ? undefined : iv.toString("hex"),
				clientSideEncryption: clientSideEncryption,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});

		return {
			id,
		};
	});

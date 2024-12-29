"use server";
import db from "@/core/db";
import { decrypt, decryptVerificationWithPBKDF } from "@/app/helpers/crypto";
import { checkRateLimitByIp } from "@/app/helpers/check-ratelimit";
import { headers } from "next/headers";
import { readTextSchema } from "@/app/schemas";
import { actionClient, ActionError } from "@/core/safe-action";
import { flattenValidationErrors } from "next-safe-action";

export const getText = actionClient
	.schema(readTextSchema, {
		handleValidationErrorsShape: (ve) => flattenValidationErrors(ve).fieldErrors,
	})
	.use(async ({ next }) => {
		const ratelimitResponse = await checkRateLimitByIp({
			ip: headers().get("x-forwarded-for")!,
			type: "text",
			action: "download",
		});

		if (ratelimitResponse.isError) {
			throw new ActionError(ratelimitResponse.data);
		}

		return next();
	})
	.action(async ({ parsedInput: { textId, password } }): Promise<{ isError: boolean; data: string }> => {
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
				data: "Text not found.",
				isError: true,
			};
		}

		let decryptedText: string;
		if (text.clientSideEncryption) {
			try {
				decryptVerificationWithPBKDF(text.text, password ?? "");
				decryptedText = text.text;
			} catch (error: any) {
				if (error.code === "ERR_OSSL_BAD_DECRYPT") {
					return {
						data: "Incorrect password.",
						isError: true,
					};
				}

				console.error(error);
				return {
					data: "Something went wrong. Please try again later.",
					isError: true,
				};
			}
		} else {
			try {
				decryptedText = decrypt(text.text, text.iv!, process.env.TEXT_ENCRYPTION_SECRET_KEY!);
			} catch (error) {
				console.error(error);

				return {
					data: "Something went wrong. Please try again later.",
					isError: true,
				};
			}
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
	});

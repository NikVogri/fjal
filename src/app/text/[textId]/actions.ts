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
		handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
	})
	// .use(async ({ next }) => {
	// 	const ratelimitResponse = await checkRateLimitByIp({
	// 		ip: headers().get("x-forwarded-for")!,
	// 		type: "text",
	// 		action: "download",
	// 	});

	// 	if (ratelimitResponse.isError) {
	// 		throw new ActionError(ratelimitResponse.data);
	// 	}

	// 	return next();
	// })
	.action(async ({ parsedInput: { textId, clientKeyHash } }): Promise<{ isError: boolean; data: string }> => {
		console.log('H"ERER');
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

		let outputText: string;
		if (text.clientSideEncryption) {
			if (!clientKeyHash) {
				// Client must compute and provide the clientKeyHash to verify they have the correct key.
				return {
					data: "Please enter password.",
					isError: true,
				};
			}

			if (clientKeyHash !== text.clientKeyHash) {
				return {
					data: "Incorrect password.",
					isError: true,
				};
			}

			outputText = text.text;
		} else {
			try {
				outputText = decrypt(text.text, text.iv!, process.env.TEXT_ENCRYPTION_SECRET_KEY!);
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
			data: outputText,
			isError: false,
		};
	});

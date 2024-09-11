"use server";

import s3 from "@/core/s3";
import db from "@/core/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ServerActionResponse } from "@/models";
import { checkRateLimitByIp } from "@/app/helpers/check-ratelimit";
import { headers } from "next/headers";
import { fileDownloadSchema } from "@/app/schemas";
import { z } from "zod";

export const createDownloadUrlAndMarkFileForDeletion = async (
	payload: z.infer<typeof fileDownloadSchema>
): Promise<ServerActionResponse> => {
	const ratelimitResponse = await checkRateLimitByIp({
		ip: headers().get("x-forwarded-for")!,
		type: "file",
		action: "download",
	});
	if (ratelimitResponse.isError) return ratelimitResponse;

	const { success, data } = fileDownloadSchema.safeParse(payload);
	if (!success) {
		return {
			isError: true,
			data: "Invalid or missing data.",
		};
	}

	try {
		// Check if object even exists in S3
		await s3.send(
			new GetObjectCommand({
				Bucket: process.env.AWS_S3_BUCKET!,
				Key: data.id,
			})
		);

		// TODO: consider removing the DB record when object does not exist

		const cmd = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: data.id,
			ResponseContentDisposition: `attachment; filename ="${data.fileName}"`,
		});
		const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });

		await db.file.update({
			where: {
				id: data.id,
			},
			data: {
				expiresAt: new Date(),
			},
		});

		return {
			data: url,
			isError: false,
		};
	} catch (error: any) {
		return {
			data: error?.Code?.includes("NoSuchKey")
				? "The requested file no longer exists."
				: "An unknown error occured, please try again later.",
			isError: true,
		};
	}
};

"use server";

import s3 from "@/core/s3";
import db from "@/core/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from "@prisma/client";
import { ratelimit } from "@/core/ratelimiter";
import { headers } from "next/headers";

export interface CreateDownloadUrlAndMarkFileForDeletionReturn {
	isError: boolean;
	data: string;
}

export const createDownloadUrlAndMarkFileForDeletion = async (
	file: File
): Promise<CreateDownloadUrlAndMarkFileForDeletionReturn> => {
	const id = (headers().get("x-forwarded-for") ?? "127.0.0.1") + "-download";
	const { success } = await ratelimit.limit(id);
	console.log("success", success, id);
	if (!success)
		return {
			data: "You've hit the daily file download limit. Try again tomorrow.",
			isError: true,
		};

	try {
		// Check if object even exists in S3
		await s3.send(
			new GetObjectCommand({
				Bucket: process.env.AWS_S3_BUCKET!,
				Key: file.id,
			})
		);

		// TODO: consider removing the DB record when object does not exist

		const cmd = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: file.id,
			ResponseContentDisposition: `attachment; filename ="${file.fileName}"`,
		});
		const url = await getSignedUrl(s3, cmd, { expiresIn: 900 });

		await db.file.update({
			where: {
				id: file.id,
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

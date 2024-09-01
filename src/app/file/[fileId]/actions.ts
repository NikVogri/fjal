"use server";

import s3 from "@/core/s3";
import db from "@/core/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from "@prisma/client";

export interface CreateDownloadUrlAndMarkFileForDeletionReturn {
	isError: boolean;
	data: string;
}

export const createDownloadUrlAndMarkFileForDeletion = async (
	file: File
): Promise<CreateDownloadUrlAndMarkFileForDeletionReturn> => {
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

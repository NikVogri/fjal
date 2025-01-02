"use server";

import db from "@/core/db";
import { checkRateLimitByIp } from "../helpers/check-ratelimit";
import { headers } from "next/headers";
import { actionClient, ActionError } from "@/core/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { fileInfoSchema } from "../schemas";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import s3, { s3GetBucketSize } from "@/core/s3";
import { _Object } from "@aws-sdk/client-s3";
import { generateSimpleId } from "../helpers/id";

export const generatePresignedUrl = actionClient
	.schema(fileInfoSchema, {
		handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
	})
	.use(async ({ next }) => {
		const ratelimitResponse = await checkRateLimitByIp({
			ip: headers().get("x-forwarded-for")!,
			type: "file",
			action: "upload",
		});

		if (ratelimitResponse.isError) {
			throw new ActionError(ratelimitResponse.data);
		}

		return next();
	})
	.use(async ({ next }) => {
		const bucketSize = await s3GetBucketSize();

		if (bucketSize > parseInt(process.env.AWS_S3_MAX_PUBLIC_BUCKET_SIZE!)) {
			throw new ActionError("Public storage is full. Please try again later.");
		}

		return next();
	})
	.action(async ({ parsedInput: { fileSize, fileName, fileType } }) => {
		const s3ObjectKey = generateSimpleId();
		const file = await db.file.create({
			data: {
				id: s3ObjectKey,
				fileName: fileName,
				size: fileSize,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				type: fileType,
			},
		});

		const presigned = await createPresignedPost(s3, {
			Expires: 900,
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: s3ObjectKey,
			Conditions: [
				{ bucket: process.env.AWS_S3_BUCKET! },
				["content-length-range", 1, fileSize],
				{ key: s3ObjectKey },
			],
		});

		return {
			file: {
				id: file.id,
			},
			presigned: {
				fields: presigned.fields,
				url: presigned.url,
			},
		};
	});

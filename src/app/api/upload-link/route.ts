import s3 from "@/core/s3";

import { createPresignedPost, PresignedPost } from "@aws-sdk/s3-presigned-post";
import { ulid } from "ulid";
import db from "@/core/db";
import { fileInfoSchema } from "@/app/schemas";
import { ratelimit } from "@/core/ratelimiter";
import { NextRequest } from "next/server";

export interface PostUploadLinkResponse {
	presigned: PresignedPost;
	file: {
		id: string;
		fileName: string;
		size: number;
		expiresAt: string;
		type: string;
	};
}

export async function POST(request: NextRequest) {
	const { success } = await ratelimit.limit((request.ip ?? "127.0.0.1") + "-upload");
	if (!success)
		return Response.json(
			{ message: "You've hit the daily file upload limit. Try again tomorrow." },
			{ status: 429 }
		);

	const { data: body, error } = fileInfoSchema.safeParse(await request.json());

	if (error || body.size > parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!))
		return Response.json("Invalid data", { status: 400 });

	const s3ObjectKey = ulid();

	const data = await db.file.create({
		data: {
			id: s3ObjectKey,
			fileName: body.title,
			size: body.size,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			type: body.type,
		},
	});

	const presigned = await createPresignedPost(s3, {
		Expires: 900,
		Bucket: process.env.AWS_S3_BUCKET!,
		Key: s3ObjectKey,
		Conditions: [
			{ bucket: process.env.AWS_S3_BUCKET! },
			["content-length-range", 1, body.size],
			{ key: s3ObjectKey },
		],
	});

	return Response.json(
		{
			presigned: {
				url: presigned.url,
				fields: presigned.fields,
			},
			file: {
				id: data.id,
				fileName: data.fileName,
				size: data.size,
				expiresAt: data.expiresAt,
				type: data.type,
			},
		},
		{ status: 200 }
	);
}

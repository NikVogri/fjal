// use server

import s3 from "@/core/s3";
import db from "@/core/db";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

export const clearFileExpires = async () => {
	const expiredFiles = await db.file.findMany({
		where: {
			expiresAt: {
				lt: new Date(),
			},
		},
		take: 1000, // max s3 delete limit per request
	});

	if (!expiredFiles.length) {
		console.log("No files to delete");
		return Response.json(null, { status: 200 });
	}

	const cmd = new DeleteObjectsCommand({
		Bucket: process.env.AWS_S3_BUCKET!,
		Delete: {
			Objects: expiredFiles.map((f) => ({ Key: f.id })),
		},
	});

	// TODO: potentially batch in the future
	await db.file.deleteMany({
		where: {
			id: {
				in: expiredFiles.map((f) => f.id),
			},
		},
	});

	console.log(`Deleted ${expiredFiles.length} files`);

	await s3.send(cmd);
};

export const clearTextExpires = async () => {
	const expiredTexts = await db.text.findMany({
		where: {
			expiresAt: {
				lt: new Date(),
			},
		},
		take: 1000,
	});

	if (!expiredTexts.length) {
		console.log("No texts to delete");
		return Response.json(null, { status: 200 });
	}

	await db.text.deleteMany({
		where: {
			id: {
				in: expiredTexts.map((f) => f.id),
			},
		},
	});

	console.log(`Deleted ${expiredTexts.length} texts`);
};

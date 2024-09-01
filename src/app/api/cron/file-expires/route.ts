import s3 from "@/core/s3";
import db from "@/core/db";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function GET(req: Request) {
	const token = (req.headers.get("authorization") ?? "").split(" ")[1];

	if (!token || token != process.env.CRON_SECRET) {
		return Response.json({ error: "Invalid or missing token" }, { status: 403 });
	}

	try {
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
		return Response.json(null, { status: 200 });
	} catch (error) {
		console.log("An error occured", error);
		return Response.json(null, { status: 500 });
	}
}

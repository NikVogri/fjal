import db from "@/core/db";

export async function GET(req: Request) {
	const token = (req.headers.get("authorization") ?? "").split(" ")[1];

	if (!token || token != process.env.CRON_SECRET) {
		return Response.json({ error: "Invalid or missing token" }, { status: 403 });
	}

	try {
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

		return Response.json(null, { status: 200 });
	} catch (error) {
		console.log("An error occured", error);
		return Response.json(null, { status: 500 });
	}
}

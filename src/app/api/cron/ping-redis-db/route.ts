import { checkVercelCronAuth } from "@/app/helpers/cron/auth";
import redis from "@/core/redis";

export async function GET(req: Request) {
	const isAuthed = checkVercelCronAuth(req);
	if (!isAuthed) {
		return Response.json({ error: "Invalid or missing token" }, { status: 403 });
	}

	try {
		await redis.set("keepalive", Date.now());
		return Response.json(null, { status: 200 });
	} catch (error) {
		console.error("Unable to set keepalive", error);
		return Response.json(null, { status: 500 });
	}
}

import { checkVercelCronAuth } from "@/app/helpers/cron/auth";
import { kv } from "@vercel/kv";

export async function GET(req: Request) {
	const isAuthed = checkVercelCronAuth(req);
	if (!isAuthed) {
		return Response.json({ error: "Invalid or missing token" }, { status: 403 });
	}

	try {
		await kv.set("keepalive", Date.now());
	} catch (error) {
		console.error("Unable to set keepalive", error);
	}
}

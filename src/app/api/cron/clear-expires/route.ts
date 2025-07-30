import { clearFileExpires, clearTextExpires } from "@/app/helpers/cron/clear-expires";
import { checkVercelCronAuth } from "@/app/helpers/cron/auth";

export async function GET(req: Request) {
	const isAuthed = checkVercelCronAuth(req);
	if (!isAuthed) {
		return Response.json({ error: "Invalid or missing token" }, { status: 403 });
	}

	try {
		await Promise.all([clearFileExpires(), clearTextExpires()]);
		return Response.json(null, { status: 200 });
	} catch (error) {
		console.log("An error occured", error);
		return Response.json(null, { status: 500 });
	}
}

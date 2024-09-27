import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {}

export const actionClient = createSafeActionClient({
	handleServerError(e) {
		console.error("Action error:", e.message);

		if (e instanceof ActionError) {
			return e.message;
		}

		return "Something went wrong. Please try again.";
	},
});

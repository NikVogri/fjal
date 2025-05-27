import { getRateLimiter } from "@/core/ratelimiter";
import { ServerActionResponse } from "@/models";

export const checkRateLimitByIp = async ({
	ip,
	type,
	action,
}: {
	ip: string;
	type: "file" | "text";
	action: "upload" | "download";
}): Promise<ServerActionResponse> => {
	const id = (ip ?? "127.0.0.1") + `-${type}-${action}`;
	try {
		const { success } = await getRateLimiter(type).limit(id);

		if (success) {
			return {
				isError: false,
				data: "",
			};
		}
	} catch (error) {
		console.error("Rate limit check failed:", error);

		return {
			data: "Something went wrong. Please try again later.",
			isError: true,
		};
	}

	return {
		data: `You've hit the daily ${type} ${action} limit. Try again tomorrow.`,
		isError: true,
	};
};

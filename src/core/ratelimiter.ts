import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

export const fileRatelimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.fixedWindow(parseInt(process.env.FILE_RATE_LIMIT!), "1 d"),
});

export const textRatelimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.fixedWindow(parseInt(process.env.TEXT_RATE_LIMIT!), "1 d"),
});

export function getRateLimiter(type: "file" | "text"): Ratelimit {
	switch (type) {
		case "file":
			return fileRatelimiter;
		case "text":
			return textRatelimiter;
		default:
			throw new Error("Unrecognized rate limiter.");
	}
}

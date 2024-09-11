import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

export const fileRatelimiter = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.fixedWindow(parseInt(process.env.FILE_RATE_LIMIT!), "1 d"),
});

export const textRatelimiter = new Ratelimit({
	redis: kv,
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

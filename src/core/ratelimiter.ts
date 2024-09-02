import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

export const ratelimit = new Ratelimit({
	redis: kv,
	// 20 requests from the same IP per 1 day
	limiter: Ratelimit.fixedWindow(parseInt(process.env.FILE_RATE_LIMIT!), "1 d"),
});

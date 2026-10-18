import { Redis } from "@upstash/redis";

// Same client setup @vercel/kv used, reading the existing KV_* env vars
const redis = new Redis({
	url: process.env.KV_REST_API_URL,
	token: process.env.KV_REST_API_TOKEN,
	cache: "default",
	enableAutoPipelining: true,
});

export default redis;

import { z } from "zod";

z.object({
	AWS_S3_REGION: z.string().min(1),
	AWS_S3_BUCKET: z.string().min(1),
	AWS_S3_MAX_PUBLIC_BUCKET_SIZE: z.string().min(1),
	AWS_USER_ACCESS_KEY: z.string().min(1),
	AWS_USER_SECRET_KEY: z.string().min(1),
	DATABASE_URL: z.string().min(1),
	CRON_SECRET: z.string().min(1),
	TEXT_ENCRYPTION_SECRET_KEY: z.string().min(1),
	FILE_RATE_LIMIT: z.string().min(1),
	TEXT_RATE_LIMIT: z.string().min(1),
	KV_URL: z.string().min(1),
	KV_REST_API_URL: z.string().min(1),
	KV_REST_API_TOKEN: z.string().min(1),
	KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
	NEXT_PUBLIC_MAX_TEXT_LENGTH: z.string().min(1),
	NEXT_PUBLIC_MAX_FILE_SIZE: z.string().min(1),
	NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
	NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1),
	NEXT_PUBLIC_MAX_TEXT_PASSWORD_LENGTH: z.string().min(1),
}).parse(process.env);

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

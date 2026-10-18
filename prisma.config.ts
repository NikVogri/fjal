import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		// Read directly so `prisma generate` also works without a database URL set
		url: process.env.DATABASE_URL,
	},
});

export const checkVercelCronAuth = (req: Request): boolean => {
	const token = (req.headers.get("authorization") ?? "").split(" ")[1];

	if (!token || token != process.env.CRON_SECRET) {
		return false;
	}

	return true;
};

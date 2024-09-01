export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const fileSize = bytes / Math.pow(1024, i);

	return `${fileSize.toFixed(2)} ${sizes[i]}`;
}

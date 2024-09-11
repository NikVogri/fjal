import crypto from "crypto";

export function generateIv() {
	return crypto.randomBytes(16);
}

export function encrypt(value: string, iv: Buffer, key: string): string {
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

	let encrypted = cipher.update(value, "utf8", "base64");
	encrypted += cipher.final("base64");

	return encrypted;
}

export function decrypt(value: string, iv: string, key: string): string {
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));

	let decrypted = decipher.update(value, "base64", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

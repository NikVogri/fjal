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

export function decryptVerificationWithPBKDF(encrypted: string, password: string): void {
	const encryptedBuff = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(null));

	const salt = encryptedBuff.slice(0, 16);
	const iv = encryptedBuff.slice(16, 16 + 16);
	const data = encryptedBuff.slice(16 + 16);

	const key = crypto.pbkdf2Sync(password, salt, 250000, 32, "SHA-256");

	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
	decipher.update(data, null, "utf8");
	decipher.final("utf8");
}

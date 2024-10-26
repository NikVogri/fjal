import crypto from "crypto";

export function generateSimpleId() {
	return crypto
		.randomBytes(6)
		.toString("base64")
		.replaceAll(/=|\+|\//g, "")
		.toLowerCase();
}

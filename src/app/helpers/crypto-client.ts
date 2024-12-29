const IV_BYTE_SIZE = 16;
const SALT_BYTE_SIZE = 16;
const ALGO_NAME = "AES-CBC";
export function checkCryptoAvailability() {
	if (!window.crypto?.subtle) {
		throw new Error("Web Crypto API not available in this browser");
	}
}

async function deriveKey(password: string, salt: BufferSource, keyUsages: KeyUsage[]): Promise<CryptoKey> {
	const encodedPassword = new TextEncoder().encode(password);

	const key = await window.crypto.subtle.importKey("raw", encodedPassword, "PBKDF2", false, ["deriveKey"]);

	const derivedKey = await window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			iterations: 250000,
			hash: "SHA-256",
			salt: salt,
		},
		key,
		{ name: ALGO_NAME, length: 256 },
		false,
		keyUsages
	);

	return derivedKey;
}

export async function encryptClient(text: string, password: string): Promise<string> {
	checkCryptoAvailability();

	const encoded = new TextEncoder().encode(text);
	const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTE_SIZE));
	const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTE_SIZE));

	const derivedKey = await deriveKey(password, salt, ["encrypt"]);

	const encryptedBuff = await window.crypto.subtle.encrypt(
		{
			name: ALGO_NAME,
			iv: iv,
		},
		derivedKey,
		encoded
	);

	const dataBuff = new Uint8Array(salt.byteLength + iv.byteLength + encryptedBuff.byteLength);
	dataBuff.set(salt, 0);
	dataBuff.set(iv, salt.byteLength);
	dataBuff.set(new Uint8Array(encryptedBuff), salt.byteLength + iv.byteLength);

	// @ts-ignore-next-line
	return btoa(String.fromCharCode.apply(null, dataBuff));
}

export async function decryptClient(encrypted: string, password: string): Promise<string> {
	checkCryptoAvailability();

	// @ts-ignore-next-line
	const encryptedBuff = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(null));

	const salt = encryptedBuff.slice(0, IV_BYTE_SIZE);
	const iv = encryptedBuff.slice(IV_BYTE_SIZE, IV_BYTE_SIZE + SALT_BYTE_SIZE);
	const data = encryptedBuff.slice(IV_BYTE_SIZE + SALT_BYTE_SIZE);

	const derivedKey = await deriveKey(password, salt, ["decrypt"]);

	const decryptedContent = await window.crypto.subtle.decrypt(
		{
			name: ALGO_NAME,
			iv: iv,
		},
		derivedKey,
		data
	);

	return new TextDecoder().decode(decryptedContent);
}

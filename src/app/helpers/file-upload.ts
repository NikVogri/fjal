import { PresignedPost } from "@aws-sdk/s3-presigned-post";

export async function uploadFile(presigned: PresignedPost, file: File) {
	const formData = new FormData();
	for (const key in presigned.fields) {
		formData.append(key, presigned.fields[key]);
	}
	formData.append("file", file);

	const res = await fetch(presigned.url, {
		method: "POST",
		body: formData,
		mode: "cors",
	});

	if (!res.ok) throw Error();
}

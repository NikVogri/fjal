import { z } from "zod";
import { fileInfoSchema, PostUploadLinkResponse } from "../api/upload-link/route";

export async function getPresignedData(file: File): Promise<PostUploadLinkResponse> {
	const res = await fetch("/api/upload-link", {
		method: "POST",
		body: JSON.stringify({
			title: file.name,
			size: file.size,
			type: file.type,
		} satisfies z.infer<typeof fileInfoSchema>),
		headers: {
			Accept: "application/json",
		},
	});

	if (!res.ok) throw Error();
	return await res.json();
}

export async function uploadFile(presigned: PostUploadLinkResponse["presigned"], file: File) {
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

"use client";

import Link from "next/link";
import { formatFileSize } from "../helpers/file-size";
import { DocumentIcon } from "./SVG/document";
import { DownloadIcon } from "./SVG/download";
import { useRouter } from "next/navigation";

export default function DownloadFile({
	file,
	createDownloadUrlAndMarkFileForDeletion,
}: {
	file: any;
	createDownloadUrlAndMarkFileForDeletion: () => Promise<string>;
}) {
	const router = useRouter();

	return (
		<div className="py-12 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30">
			<DocumentIcon />

			<h1 className="font-medium text-2xl text-indigo-500 text-center mb-4">{file.fileName}</h1>
			<ul className="mb-8">
				<li>
					<strong>Type:</strong> {file.type}
				</li>
				<li>
					<strong>Size:</strong> {formatFileSize(file.size)}
				</li>
				<li>
					<strong>Uploaded:</strong> {file.createdAt.toUTCString().slice(0, 16)}
				</li>
				<li>
					<strong>Expires:</strong> {file.expiresAt.toUTCString().slice(0, 16)}
				</li>
			</ul>

			<button
				onClick={() =>
					createDownloadUrlAndMarkFileForDeletion().then((url) => {
						window?.open(url);
						router.replace("/");
					})
				}
				className="px-4 py-2 font-bold mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center"
			>
				<DownloadIcon />
				Download now
			</button>

			<p className="italic text-xs text-gray-500 my-4 text-center">
				The file will be deleted after clicking the download button.
			</p>

			<p className="text-center">
				Go to{" "}
				<Link href="/" className="text-indigo-500">
					file upload
				</Link>{" "}
				instead.
			</p>
		</div>
	);
}

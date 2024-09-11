"use client";

import Link from "next/link";
import { formatFileSize } from "../helpers/file-size";
import { DocumentIcon } from "./SVG/document";
import { DownloadIcon } from "./SVG/download";
import { useState } from "react";
import { File } from "@prisma/client";
import Card from "./UI/card";
import { ServerActionResponse } from "../file/[fileId]/actions";

export default function DownloadFile({
	file,
	createDownloadUrlAndMarkFileForDeletion,
}: {
	file: File;
	createDownloadUrlAndMarkFileForDeletion: () => Promise<ServerActionResponse>;
}) {
	const [downloaded, setDownloaded] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	if (error) {
		return (
			<Card>
				<div className="text-center">
					<p className="mb-4">{error}</p>

					<p className="text-center">
						<Link href="/" className="text-indigo-500">
							Upload another file
						</Link>{" "}
						or{" "}
						<Link href="/text" className="text-indigo-500">
							Share text
						</Link>
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			<div className="flex justify-center mb-2">
				<DocumentIcon size={8} />
			</div>

			<h1 className="font-medium text-xl text-indigo-500 text-center mb-4 break-all text-wrap">
				{file.fileName}
			</h1>

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

			<div className="my-4">
				<button
					onClick={() =>
						createDownloadUrlAndMarkFileForDeletion().then(({ isError, data }) => {
							if (isError) {
								setError(data);
								return;
							}

							const anchor = document.createElement("a");
							anchor.href = data;
							document.body.appendChild(anchor);
							anchor.click();
							document.body.removeChild(anchor);
							setDownloaded(true);
						})
					}
					disabled={downloaded}
					className="py-2 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
				>
					<DownloadIcon />
					Download now
				</button>

				<p className="italic text-xs text-gray-500 mt-2 text-center">
					The file will be deleted after clicking the download button.
				</p>
			</div>

			<p className="text-center">
				Go to{" "}
				<Link href="/" className="text-indigo-500">
					file upload
				</Link>{" "}
				instead.
			</p>
		</Card>
	);
}

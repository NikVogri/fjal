"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { UploadIcon } from "./SVG/upload-icon";
import { PostUploadLinkResponse } from "../api/upload-link/route";
import UploadProcessing from "./upload-processing";
import UploadDone from "./upload-done";
import UploadError from "./upload-error";
import { formatFileSize } from "../helpers/file-size";
import { getPresignedData, uploadFile } from "../helpers/file-upload";
import { DocumentIcon } from "./SVG/document";
import Card from "./UI/card";
import Link from "next/link";

export default function UploadForm() {
	const [error, setError] = useState<string | null>("");
	const [formError, setFormError] = useState<string | null>("");
	const [file, setFile] = useState<File | null>();
	const [uploadStatus, setUploadStatus] = useState<{
		status: "uploding" | "done" | "none";
		fileInfo?: PostUploadLinkResponse["file"];
	}>();

	const handleUpload = async (e: FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!file) return;

		if (file.size > parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)) {
			alert(
				`File size is too large! Please make sure the file is under ${formatFileSize(
					parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)
				)}!`
			);

			setFile(null);
			return;
		}

		try {
			setUploadStatus({ status: "uploding" });

			const data = await getPresignedData(file);
			await uploadFile(data.presigned, file);

			setUploadStatus({ status: "done", fileInfo: data.file });
			setFile(null);
		} catch (err: any) {
			setError(err.message || "Something unexpected went wrong. Please try again later.");
		}
	};

	const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files![0];
		if (!file) return;

		if (file.size > parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)) {
			setFormError(
				`File size is too large! Please make sure the file is under ${formatFileSize(
					parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)
				)}!`
			);

			return;
		}

		setFormError(null);
		setFile(file);
	};

	const handleReset = () => {
		setFile(null);
		setFormError(null);
		setUploadStatus({ status: "none" });
		setError(null);
	};

	if (error) {
		return <UploadError error={error.toString()} />;
	}

	if (uploadStatus?.status === "done") {
		return <UploadDone id={uploadStatus.fileInfo!.id} type="file" onUploadAnother={handleReset} />;
	}

	if (uploadStatus?.status === "uploding") {
		return <UploadProcessing type="file" />;
	}

	return (
		<Card>
			<form onSubmit={handleUpload}>
				<h1 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly upload a file!</h1>
				<h2 className="text-center mb-8">Quickly and securely share a file to another person or device!</h2>

				{formError && <p className="text-red-500 text-sm font-medium mb-4">{formError}</p>}

				{!file && (
					<label className="mb-4 block cursor-pointer">
						<span className="bg-indigo-500 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto">
							Select File
						</span>
						<input
							type="file"
							onChange={handleSelectFile}
							className="w-full border border-solid rounded border-indigo-800 p-2 mb-4"
							hidden
						/>
					</label>
				)}

				{file && (
					<div className="mb-8">
						<div className="mb-4 flex flex-col items-center">
							<DocumentIcon size={8} />
						</div>

						<h1 className="font-medium text-lg text-indigo-500 text-center mb-8 break-all text-wrap">
							{file.name}
						</h1>

						<button
							type="submit"
							className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
							disabled={!file}
						>
							<UploadIcon />
							Upload
						</button>

						<button type="button" className="block mx-auto text-gray-400 font-medium" onClick={handleReset}>
							Select other file
						</button>
					</div>
				)}

				<p className="italic text-gray-500 mt-8 text-xs">
					<strong>Important:</strong> This is not a permanent file storage solution. The uploaded file is
					temporary and can only be downloaded once. It will be deleted after download or automatically after
					7 days.
				</p>
			</form>

			<p className="text-center">
				<Link href="/text" className="text-indigo-500 text-sm">
					Share text instead
				</Link>
			</p>
		</Card>
	);
}

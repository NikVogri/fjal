"use client";

import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { UploadIcon } from "./SVG/upload-icon";
import { fileInfoSchema, PostUploadLinkResponse } from "../api/upload-link/route";
import { z } from "zod";
import { Checkmark } from "./SVG/checkmark";
import Link from "next/link";
import QrCode from "qrcode";

export default function UploadForm() {
	const [error, setError] = useState<string | null>("");
	const [file, setFile] = useState<File | null>();
	const [uploadStatus, setUploadStatus] = useState<{
		status: "uploding" | "done";
		fileInfo?: PostUploadLinkResponse["file"];
	}>();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (canvasRef.current && uploadStatus?.fileInfo?.id)
			QrCode.toCanvas(canvasRef.current, `${window.location.origin}/file/${uploadStatus.fileInfo.id}`);
	}, [canvasRef, uploadStatus?.fileInfo?.id]);

	const handleUpload = async (e: FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!file) return;

		if (file?.size > parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)) {
			throw new Error("Filesize is too big!");
		}

		try {
			setUploadStatus({ status: "uploding" });

			let res = await fetch("/api/upload-link", {
				method: "POST",
				body: JSON.stringify({
					title: file.name,
					size: file.size,
					type: file.type,
				} satisfies z.infer<typeof fileInfoSchema>),
				headers: {
					expect: "application/json",
				},
			});

			if (!res.ok) throw Error();

			const data = (await res.json()) as PostUploadLinkResponse;

			const formData = new FormData();
			for (const key in data.presigned.fields) {
				formData.append(key, data.presigned.fields[key]);
			}
			formData.append("file", file);

			res = await fetch(data.presigned.url, {
				method: "POST",
				body: formData,
				mode: "cors",
			});

			if (!res.ok) throw Error();

			setUploadStatus({ status: "done", fileInfo: data.file });
			setFile(null);
		} catch (err) {
			setError((err as any).message ?? "Something went wrong. Please try again later.");
		}
	};

	const handleCopyFileUrlToClipboard = () => {
		navigator.clipboard.writeText(`${window.location.origin}/file/${uploadStatus?.fileInfo?.id}`);
	};

	if (uploadStatus?.status === "done") {
		return (
			<div className="py-12 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30">
				<Checkmark />
				<h2 className="text-2xl text-center font-medium text-indigo-500 mb-4">File uploaded!</h2>
				<p className="text-center mb-8 text-md">
					The uploaded file is temporary and can only be downloaded once. It will be deleted after download or
					automatically after 7 days.
				</p>
				<canvas ref={canvasRef} className="w-full mx-auto my-8"></canvas>
				<button className="bg-indigo-500 text-white w-full p-2 rounded" onClick={handleCopyFileUrlToClipboard}>
					Copy URL
				</button>
				<Link href="/" className="text-indigo-500 mt-4 block text-center font-medium">
					Upload another file
				</Link>{" "}
			</div>
		);
	}

	if (uploadStatus?.status === "uploding") {
		return (
			<div className="py-12 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30">
				<h2 className="text-2xl text-center font-bold text-indigo-500">Your file is being uploaded!</h2>

				<div className="my-8 text-center">
					<div
						className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] text-indigo-500"
						role="status"
					></div>
				</div>

				<h3 className="text-lg text-center my-2 text-indigo-700">While you wait, here&apos;s a fun fact:</h3>
				<p className="text-xs italic text-gray-500 text-center">
					Honey never spoils; archaeologists have found 3,000-year-old honey that&apos;s still edible.
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-12 px-4 bg-white rounded-2xl w-96 min-h-32 shadow-sm">
				<p className="text-center">{error}</p>
			</div>
		);
	}

	return (
		<form
			className="py-8 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30"
			onSubmit={handleUpload}
		>
			<h2 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly upload a file!</h2>
			<p className="text-center mb-8">Quickly and securely share a file to another person or device!</p>

			<input
				type="file"
				onChange={(e) => setFile(e.target.files![0])}
				className="w-full border border-solid rounded border-indigo-800 p-2 mb-4"
			/>

			<button
				type="submit"
				className="bg-indigo-500 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
				disabled={!file}
			>
				<UploadIcon />
				Upload
			</button>

			<p className="italic text-gray-500 mt-4 text-xs">
				The uploaded file is temporary and can only be downloaded once. It will be deleted after download or
				automatically after 7 days.
			</p>
		</form>
	);
}

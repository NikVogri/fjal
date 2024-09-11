"use client";

import { FormEvent, useState } from "react";
import UploadProcessing from "./upload-processing";
import UploadError from "./upload-error";
import Card from "./UI/card";
import { storeText } from "../text/actions";
import UploadDone from "./upload-done";
import Link from "next/link";

export default function TextForm() {
	const [error, setError] = useState<string | null>("");
	const [text, setText] = useState<string>("");
	const [uploadStatus, setUploadStatus] = useState<{
		status: "uploding" | "done" | "none";
		textInfo?: { id: string };
	}>();

	const handleSave = async (e: FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!text) return;

		if (text.length > parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)) {
			alert(
				`Text is too long. Make sure it contains fewer than ${process.env.NEXT_PUBLIC_MAX_TEXT_LENGT} characters.`
			);

			return;
		}

		try {
			setUploadStatus({ status: "uploding" });
			const res = await storeText({ text: text });
			if (res.isError) throw res;

			setUploadStatus({ status: "done", textInfo: { id: res.data } });
			setText("");
		} catch (err: any) {
			setError(err.data || "Something unexpected went wrong. Please try again later.");
		}
	};

	const handleReset = () => {
		setText("");
		setUploadStatus({ status: "none" });
		setError(null);
	};

	if (error) {
		return <UploadError error={error.toString()} />;
	}

	if (uploadStatus?.status === "done") {
		return <UploadDone id={uploadStatus.textInfo?.id!} type="text" onUploadAnother={handleReset} />;
	}

	if (uploadStatus?.status === "uploding") {
		return <UploadProcessing type="text" />;
	}

	return (
		<Card>
			<h1 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly share any text!</h1>
			<h2 className="text-center mb-4">
				Quickly and securely share a link or other text to another person or device.
			</h2>

			<form onSubmit={handleSave}>
				<textarea
					name="text"
					rows={6}
					className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
					placeholder="Write the text you want to share here..."
					onChange={(e) => setText(e.target.value)}
					value={text}
					maxLength={parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)}
				></textarea>

				<span className="text-xs italic mb-4 mt-2 text-gray-400 text-right block">
					{text.length}/{process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH}
				</span>

				<button
					type="submit"
					className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
					disabled={!text}
				>
					Save
				</button>
			</form>

			<p className="text-gray-500 mt-4 text-xs">
				<strong>
					Before being stored, this text will be server-side encrypted using the latest encryption algorithm.
				</strong>
			</p>

			<p className="italic text-gray-500 mt-4 text-xs">
				<strong>Important:</strong> This is not a permanent text storage solution. The saved text is temporary
				and can only be viewed once. It will be deleted after viewing or automatically after 7 days.
			</p>

			<p className="text-center mt-4">
				<Link href="/" className="text-indigo-500 text-sm">
					Upload a file instead
				</Link>
			</p>
		</Card>
	);
}

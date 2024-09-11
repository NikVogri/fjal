import { useLayoutEffect, useRef } from "react";
import { Checkmark } from "./SVG/checkmark";
import QrCode from "qrcode";
import Card from "./UI/card";
import { useCopyTimeout } from "../hooks/useCopyTimeout";

interface UploadDoneProps {
	id: string;
	type: "file" | "text";
	onUploadAnother: () => void;
}

export default function UploadDone({ id, type, onUploadAnother }: UploadDoneProps) {
	const url = `${window.location.origin}/${type}/${id}`;

	const { onCopy, copied } = useCopyTimeout(() => {
		navigator.clipboard.writeText(url);
		return true;
	});

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (canvasRef.current && id) QrCode.toCanvas(canvasRef.current, url);
	}, [canvasRef, id, url]);

	return (
		<Card>
			<Checkmark />
			<h2 className="text-2xl text-center font-medium text-indigo-500 mb-4">
				{type === "file" && "File uploaded!"}
				{type === "text" && "Text stored!"}
			</h2>
			<p className="text-center mb-8 text-md">
				{type === "file" &&
					`The uploaded file is temporary and can only be downloaded once. It will be deleted after download or
				automatically after 7 days.`}

				{type === "text" &&
					`Text is stored temporarily and can only be viewed once. It will be deleted after it's viewed or
				automatically after 7 days.`}
			</p>
			<canvas ref={canvasRef} className="w-full mx-auto my-8"></canvas>
			<button
				className="bg-indigo-500 text-white w-full p-2 rounded disabled:opacity-50 mb-3"
				onClick={onCopy}
				disabled={copied}
			>
				{copied ? "URL Copied" : "Copy URL"}
			</button>

			<div className="text-center">
				<button type="button" onClick={onUploadAnother} className="text-gray-400  text-center font-medium">
					{type === "file" && "Upload another file"}
					{type === "text" && "Share another text"}
				</button>
			</div>
		</Card>
	);
}

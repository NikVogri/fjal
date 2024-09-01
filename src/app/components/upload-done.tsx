import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Checkmark } from "./SVG/checkmark";
import { File } from "@prisma/client";
import QrCode from "qrcode";
import Card from "./UI/Card";

export default function UploadDone({ fileId, onUploadAnother }: { fileId: File["id"]; onUploadAnother: () => void }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		let copiedTimeout: NodeJS.Timeout;

		if (copied) {
			copiedTimeout = setTimeout(() => setCopied(false), 1500);
		}

		return () => clearTimeout(copiedTimeout);
	}, [copied]);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (canvasRef.current && fileId) QrCode.toCanvas(canvasRef.current, `${window.location.origin}/file/${fileId}`);
	}, [canvasRef, fileId]);

	const handleCopyFileUrlToClipboard = () => {
		navigator.clipboard.writeText(`${window.location.origin}/file/${fileId}`);
		setCopied(true);
	};

	return (
		<Card>
			<Checkmark />
			<h2 className="text-2xl text-center font-medium text-indigo-500 mb-4">File uploaded!</h2>
			<p className="text-center mb-8 text-md">
				The uploaded file is temporary and can only be downloaded once. It will be deleted after download or
				automatically after 7 days.
			</p>
			<canvas ref={canvasRef} className="w-full mx-auto my-8"></canvas>
			<button
				className="bg-indigo-500 text-white w-full p-2 rounded disabled:opacity-50 mb-3"
				onClick={handleCopyFileUrlToClipboard}
				disabled={copied}
			>
				{copied ? "URL Copied" : "Copy URL"}
			</button>

			<div className="text-center">
				<button type="button" onClick={onUploadAnother} className="text-gray-400  text-center font-medium">
					Upload another file
				</button>{" "}
			</div>
		</Card>
	);
}

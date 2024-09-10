"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Card from "./UI/Card";
import { ServerActionResponse } from "@/models";
import { TextIcon } from "./SVG/text";

export default function TextView({ viewText }: { viewText: () => Promise<ServerActionResponse> }) {
	const [viewed, setViewed] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [text, setText] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		let copiedTimeout: NodeJS.Timeout;

		if (copied) {
			copiedTimeout = setTimeout(() => setCopied(false), 1500);
		}

		return () => clearTimeout(copiedTimeout);
	}, [copied]);

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

	const handleCopyText = () => {
		if (!text) return;

		navigator.clipboard.writeText(text);
		setCopied(true);
	};

	return (
		<Card>
			<div className="flex justify-center mb-2">
				<TextIcon size={8} />
			</div>

			<div className="my-4">
				{text && (
					<>
						<textarea
							name="text"
							rows={6}
							className="mb-4 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
							disabled
							value={text}
						></textarea>

						<button
							onClick={handleCopyText}
							disabled={copied}
							className="py-2 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
						>
							Copy text
						</button>
					</>
				)}

				{!text && (
					<>
						<p className="font-medium text-center mb-4">
							This text will be deleted after clicking the View now button.
						</p>
						<button
							onClick={() =>
								viewText().then(({ isError, data }) => {
									if (isError) {
										setError(data);
										return;
									}

									setViewed(true);
									setText(data);
								})
							}
							disabled={viewed}
							className="py-2 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
						>
							View now
						</button>
					</>
				)}
			</div>

			<p className="text-center">
				<Link href="/text" className="text-indigo-500">
					Share another text
				</Link>{" "}
			</p>
		</Card>
	);
}

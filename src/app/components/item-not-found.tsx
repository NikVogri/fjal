import Link from "next/link";
import Card from "./UI/card";

export default function ItemNotFound({ type }: { type: "file" | "text" }) {
	return (
		<div className="h-screen w-full flex items-center justify-center">
			<Card>
				<div className="mb-8 text-center">
					<h2 className="text-4xl text-indigo-500 font-bold">404</h2>
					<p className="text-lg text-indigo-500 font-medium mb-4">File not found</p>
					<p>
						{type === "file" && `The requested file does not exist, has expired or was already downloaded.`}
						{type === "text" && `The requested text does not exist, has expired or was already viewed.`}
					</p>
				</div>
				<p className="text-center">
					<Link href="/" className="text-indigo-500">
						Upload file
					</Link>{" "}
					or{" "}
					<Link href="/text" className="text-indigo-500">
						Share text
					</Link>
				</p>
			</Card>
		</div>
	);
}

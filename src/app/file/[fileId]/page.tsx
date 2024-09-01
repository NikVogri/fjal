import DownloadFile from "@/app/components/download-file";
import db from "@/core/db";
import { createDownloadUrlAndMarkFileForDeletion } from "./actions";
import Card from "@/app/components/UI/Card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { fileId: string } }) {
	const file = await db.file.findFirst({
		where: {
			id: params.fileId,
			expiresAt: {
				gt: new Date(),
			},
		},
	});

	if (!file) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Card>
					<div className="mb-8 text-center">
						<h2 className="text-4xl text-indigo-500 font-bold">404</h2>
						<p className="text-lg text-indigo-500 font-medium mb-4">File not found</p>
						<p>The requested file does not exist, has expired or was already opened.</p>
					</div>

					<p className="text-center">
						Go to{" "}
						<Link href="/" className="text-indigo-500">
							file upload
						</Link>{" "}
						instead.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="h-screen w-full flex flex-col items-center justify-center">
			<DownloadFile
				file={file}
				createDownloadUrlAndMarkFileForDeletion={createDownloadUrlAndMarkFileForDeletion.bind(null, file)}
			/>

			<p className="my-5 w-96">
				Created by Nik Vogrinec. Visit{" "}
				<a href="https://nikvogrinec.com" className="text-indigo-800">
					nikvogrinec.com
				</a>{" "}
				for more!
			</p>
		</div>
	);
}

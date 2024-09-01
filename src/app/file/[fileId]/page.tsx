import DownloadFile from "@/app/components/download-file";
import db from "@/core/db";
import s3 from "@/core/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
				<div className="py-12 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30">
					<h2>File not found;</h2>
					<p>File expired or was opened.</p>
				</div>
			</div>
		);
	}

	const createDownloadUrlAndMarkFileForDeletion = async () => {
		"use server";

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET!,
			Key: file.id,
			ResponseContentDisposition: `attachment; filename ="${file.fileName}"`,
		});

		const url = await getSignedUrl(s3, command, { expiresIn: 900 });

		await db.file.update({
			where: {
				id: params.fileId,
			},
			data: {
				expiresAt: new Date(),
			},
		});

		return url;
	};

	return (
		<div className="h-screen w-full flex flex-col items-center justify-center">
			<DownloadFile
				file={file}
				createDownloadUrlAndMarkFileForDeletion={createDownloadUrlAndMarkFileForDeletion}
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

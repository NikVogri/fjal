import DownloadFile from "@/app/components/file-download";
import db from "@/core/db";
import { createDownloadUrlAndMarkFileForDeletion } from "./actions";
import ItemNotFound from "@/app/components/item-not-found";

export const dynamic = "force-dynamic";

export default async function FilePage({ params }: { params: Promise<{ fileId: string }> }) {
	const { fileId } = await params;
	const file = await db.file.findFirst({
		where: {
			id: fileId,
			expiresAt: {
				gt: new Date(),
			},
		},
	});

	if (!file) {
		return <ItemNotFound type="file" />;
	}

	return (
		<div className="h-screen w-full flex flex-col items-center justify-center">
			<DownloadFile
				file={file}
				createDownloadUrlAndMarkFileForDeletion={createDownloadUrlAndMarkFileForDeletion.bind(null, {
					fileName: file.fileName,
					id: file.id,
				})}
			/>
		</div>
	);
}

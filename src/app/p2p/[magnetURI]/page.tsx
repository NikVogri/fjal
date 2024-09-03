import P2PTransferDownload from "@/app/components/p2p-transfer-download";

export default function P2PMagnetURI({
	params,
}: {
	params: {
		magnetURI: string;
	};
}) {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<P2PTransferDownload magnetUri={params.magnetURI} />
		</div>
	);
}

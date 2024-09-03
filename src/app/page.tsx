import Link from "next/link";
import UploadForm from "./components/upload-form";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<UploadForm />
			<Link href={`/p2p`}>Transfer larger files via peer-to-peer instead.</Link>
		</div>
	);
}

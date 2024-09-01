import UploadForm from "./components/upload-form";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<UploadForm />
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

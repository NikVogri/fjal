import Card from "./UI/card";

export default function UploadError({ error, onRetry }: { error: string; onRetry: () => void }) {
	return (
		<Card>
			<p className="text-center mb-4">{error}</p>
			<button
				type="button"
				onClick={onRetry}
				className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
			>
				Go back
			</button>
		</Card>
	);
}

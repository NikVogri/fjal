import Card from "./UI/Card";

export default function UploadError({ error }: { error: string }) {
	return (
		<Card>
			<p className="text-center">{error}</p>
		</Card>
	);
}

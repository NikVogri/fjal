import db from "@/core/db";
import Card from "@/app/components/UI/card";
import Link from "next/link";
import { viewText } from "./actions";
import TextView from "@/app/components/text-view";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { textId: string } }) {
	const text = await db.text.findFirst({
		where: {
			id: params.textId,
			expiresAt: {
				gt: new Date(),
			},
		},
	});

	if (!text) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Card>
					<div className="mb-8 text-center">
						<h2 className="text-4xl text-indigo-500 font-bold">404</h2>
						<p className="text-lg text-indigo-500 font-medium mb-4">Text not found</p>
						<p>The requested text does not exist, has expired or was already viewed.</p>
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

	return (
		<div className="h-screen w-full flex flex-col items-center justify-center">
			<TextView viewText={viewText.bind(null, text.id)} />
		</div>
	);
}

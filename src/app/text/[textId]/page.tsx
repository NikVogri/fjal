import db from "@/core/db";
import { viewText } from "./actions";
import TextView from "@/app/components/text-view";
import ItemNotFound from "@/app/components/item-not-found";

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
		return <ItemNotFound type="text" />;
	}

	return (
		<div className="h-screen w-full flex flex-col items-center justify-center">
			<TextView viewText={viewText.bind(null, { textId: text.id })} />
		</div>
	);
}

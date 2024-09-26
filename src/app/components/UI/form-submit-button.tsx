import { useEffect } from "react";
import { useFormStatus } from "react-dom";

export default function FormSubmitButton({ onPendingChange }: { onPendingChange: (pending: boolean) => void }) {
	const { pending } = useFormStatus();

	useEffect(() => {
		onPendingChange(pending);
	}, [pending, onPendingChange]);

	return (
		<button
			type="submit"
			className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
			disabled={pending}
		>
			Save
		</button>
	);
}

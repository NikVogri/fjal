export default function Card({ children }: { children: React.ReactNode }) {
	return (
		<div className="py-8 px-4 rounded-2xl w-96 min-h-32 shadow-xl border-2 border-solid border-gray-300/30">
			{children}
		</div>
	);
}

import { useEffect, useState } from "react";

export const useCopyTimeout = (fn: () => boolean) => {
	const [copied, setCopied] = useState<boolean>(false);

	useEffect(() => {
		let copiedTimeout: NodeJS.Timeout;

		if (copied) {
			copiedTimeout = setTimeout(() => setCopied(false), 1500);
		}

		return () => clearTimeout(copiedTimeout);
	}, [copied]);

	const handleCopy = () => {
		const success = fn();
		if (success) setCopied(true);
	};

	return { onCopy: handleCopy, copied };
};

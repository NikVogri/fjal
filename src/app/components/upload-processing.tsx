import { useEffect, useState } from "react";
import Card from "./UI/Card";

const facts = [
	"Bananas are berries, but strawberries aren't!",
	"Octopuses have three hearts and blue blood.",
	"Honey never spoils; archaeologists have found 3,000-year-old honey that's still edible.",
	"Wombat poop is cube-shaped, helping it stay in place and mark territory.",
	"A group of flamingos is called a 'flamboyance.'",
	"There's a species of jellyfish that can potentially live forever by reverting to its juvenile form.",
	"The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896.",
	"Butterflies taste with their feet.",
	"Venus is the only planet that rotates clockwise.",
	"A day on Venus is longer than its year.",
];

let lastTwoFacts: number[] = [];
function getRandomFact() {
	let factIdx;
	do {
		factIdx = Math.floor(Math.random() * facts.length);
	} while (lastTwoFacts.includes(factIdx));

	if (lastTwoFacts.length < 2) {
		lastTwoFacts.push(factIdx);
	} else {
		lastTwoFacts.shift();
		lastTwoFacts.push(factIdx);
	}

	return facts[factIdx];
}

export default function UploadProcessing() {
	const [fact, setFact] = useState(getRandomFact());

	useEffect(() => {
		const changeFactInterval = setInterval(() => setFact(getRandomFact()), 5000);
		return () => clearInterval(changeFactInterval);
	}, []);

	return (
		<Card>
			<h2 className="text-2xl text-center font-bold text-indigo-500">Your file is being uploaded!</h2>

			<div className="my-8 text-center">
				<div
					className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] text-indigo-500"
					role="status"
				></div>
			</div>

			<h3 className="text-lg text-center my-2 text-indigo-700">While you wait, here&apos;s a fun fact:</h3>
			<p className="text-xs italic text-gray-500 text-center">{fact}</p>
		</Card>
	);
}
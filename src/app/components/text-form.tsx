"use client";

import { useRef, useState } from "react";
import UploadProcessing from "./upload-processing";
import Card from "./UI/card";
import { storeText } from "../text/actions";
import UploadDone from "./upload-done";
import Link from "next/link";
import FormSubmitButton from "./UI/form-submit-button";
import { useFormState } from "react-dom";

export default function TextForm() {
	const [formPending, setFormPending] = useState(false);
	const [formState, storeTextAction] = useFormState(storeText, {
		isError: false,
		errors: {},
		data: undefined,
	});

	const formRef = useRef<HTMLFormElement>(null);
	const textValueRef = useRef<string>("");

	const handleReset = () => {
		formRef.current?.reset();
		textValueRef.current = "";
	};

	if (formState.data) {
		return <UploadDone id={formState.data.id} type="text" onUploadAnother={handleReset} />;
	}

	if (formPending) {
		return <UploadProcessing type="text" />;
	}

	console.log(textValueRef.current);

	return (
		<Card>
			<h1 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly share any text!</h1>
			<h2 className="text-center mb-4">
				Quickly and securely share a link or other text to another person or device.
			</h2>

			{formState.errors.other && (
				<div className="border border-solid rounded bg-red-400 text-white">
					{formState.errors.other.join(", ")}
				</div>
			)}

			<form action={storeTextAction} ref={formRef}>
				<textarea
					name="text"
					rows={6}
					className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
					placeholder="Write the text you want to share here..."
					maxLength={parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)}
					onChange={(e) => (textValueRef.current = e.target.value)}
				></textarea>

				<span className="text-xs italic mb-4 mt-2 text-gray-400 text-right block">
					{textValueRef.current.length}/{process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH}
				</span>

				<FormSubmitButton onPendingChange={(p) => setFormPending(p)} />
			</form>

			<p className="text-gray-500 mt-4 text-xs">
				<strong>
					Before being stored, this text will be server-side encrypted using the latest encryption algorithm.
				</strong>
			</p>

			<p className="italic text-gray-500 mt-4 text-xs">
				<strong>Important:</strong> This is not a permanent text storage solution. The saved text is temporary
				and can only be viewed once. It will be deleted after viewing or automatically after 7 days.
			</p>

			<p className="text-center mt-4">
				<Link href="/" className="text-indigo-500 text-sm">
					Upload a file instead
				</Link>
			</p>
		</Card>
	);
}

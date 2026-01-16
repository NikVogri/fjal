"use client";

import Link from "next/link";
import { useState } from "react";
import Card from "./UI/card";
import { TextIcon } from "./SVG/text";
import { useCopyTimeout } from "../hooks/useCopyTimeout";
import posthog from "posthog-js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { readTextSchema } from "../schemas";
import { decryptClient, hashPassword } from "../helpers/crypto-client";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getText } from "../text/[textId]/actions";
import LoaderWithFacts from "./loader-with-facts";

export default function TextView({
	textId,
	isClientSideEncrypted,
}: {
	textId: string;
	isClientSideEncrypted: boolean;
}) {
	const [viewed, setViewed] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [text, setText] = useState<string | null>(null);

	const form = useForm<z.infer<typeof readTextSchema>>({
		resolver: zodResolver(readTextSchema),
		defaultValues: {
			password: "",
			clientSideEncryption: isClientSideEncrypted,
			textId: textId,
		},
	});

	const handleReset = () => {
		setError(null);
		setViewed(false);
		setText(null);
		setLoading(false);
		form.reset();
	};

	const { onCopy, copied } = useCopyTimeout(() => {
		if (!text) return false;

		navigator.clipboard.writeText(text);
		return true;
	});

	if (error) {
		return (
			<Card>
				<div className="flex flex-col items-center justify-center mb-2">
					<div className="mb-2">
						<TextIcon size={8} />
					</div>

					<h2 className="text-indigo-500 font-bold text-xl">
						{isClientSideEncrypted ? "Password Protected Text" : "Encrypted Text"}
					</h2>
				</div>

				<div className="text-center">
					<p className="mb-4">{error}</p>

					{error === "Incorrect password." && (
						<button
							onClick={handleReset}
							className="py-2 my-8 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
						>
							Retry
						</button>
					)}

					<p className="text-center">
						<Link href="/file" className="text-indigo-500">
							Upload another file
						</Link>{" "}
						or{" "}
						<Link href="/text" className="text-indigo-500">
							Share text
						</Link>
					</p>
				</div>
			</Card>
		);
	}

	if (loading) {
		return <LoaderWithFacts action="read" type="text" />;
	}

	return (
		<Card>
			<div className="flex flex-col items-center justify-center mb-2">
				<div className="mb-2">
					<TextIcon size={8} />
				</div>

				<h2 className="text-indigo-500 font-bold text-xl">
					{isClientSideEncrypted ? "Password Protected Text" : "Encrypted Text"}
				</h2>
			</div>

			<div className="my-4">
				{text && (
					<>
						<textarea
							name="text"
							rows={6}
							className="mb-4 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
							disabled
							value={text}
						></textarea>

						<button
							onClick={onCopy}
							disabled={copied}
							className="py-2 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
						>
							Copy text
						</button>
					</>
				)}

				{!text && (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(async ({ password }) => {
								posthog.capture("Viewtext", { textId });
								setLoading(true);

								const res = await getText({
									textId,
									clientSideEncryption: isClientSideEncrypted,
									clientKeyHash: password && (await hashPassword(password)),
								});
								if (!res?.data) return;

								const { data, isError } = res.data;
								console.log("EREROR")

								if (isError) {
									setError(data);
									return;
								}

								let text = data;
								if (isClientSideEncrypted && password) {
									try {
										text = await decryptClient(data, password);
									} catch (error) {
										console.log("error", error);
									}
								}

								setViewed(true);
								setLoading(false);
								setText(text);
							})}
						>
							{isClientSideEncrypted && (
								<>
									<FormField
										control={form.control}
										rules={{ required: true }}
										name="password"
										render={({ field }) => (
											<FormItem className="mb-4">
												<FormMessage />
												<FormControl>
													<Input
														{...field}
														className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
														placeholder="SuperSecretPassword"
														maxLength={parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)}
														type="password"
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</>
							)}

							<button
								type="submit"
								disabled={viewed || (isClientSideEncrypted && !form.formState.isValid)}
								className="py-2 w-full mx-auto text-white rounded bg-indigo-500 flex gap-3 justify-center disabled:opacity-50"
							>
								View now
							</button>
							<p className="italic text-gray-500 mt-2 text-xs">
								This text will be deleted after clicking the &quot;View now&quot; button.
							</p>
						</form>
					</Form>
				)}
			</div>

			<p className="text-center">
				<Link href="/text" className="text-indigo-500">
					Share another text
				</Link>{" "}
			</p>
		</Card>
	);
}

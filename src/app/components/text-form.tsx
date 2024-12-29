"use client";

import UploadError from "./upload-error";
import Card from "./UI/card";
import { storeText } from "../text/actions";
import UploadDone from "./upload-done";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeTextFormSchema } from "../schemas";
import { z } from "zod";
import { FormControl, FormDescription, FormField, FormItem, FormMessage, Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { encryptClient } from "../helpers/crypto-client";
import LoaderWithFacts from "./loader-with-facts";

export default function TextForm() {
	const { execute: storeTextAction, result, isPending, reset: resetAction } = useAction(storeText);

	const form = useForm<z.infer<typeof storeTextFormSchema>>({
		resolver: zodResolver(storeTextFormSchema),
		defaultValues: {
			text: "",
			clientSideEncryption: false,
			password: "",
		},
	});

	const handleReset = () => {
		form.reset();
		resetAction();
	};

	const useClientSideEncryption = form.watch("clientSideEncryption");

	if (isPending) {
		return <LoaderWithFacts action="upload" type="text" />;
	}

	if (result.data) {
		return <UploadDone id={result.data.id} type="text" onUploadAnother={handleReset} />;
	}

	if (result.serverError) {
		return <UploadError error={result.serverError ?? "An unknown error occured"} onRetry={handleReset} />;
	}

	return (
		<Card>
			<h1 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly share any text!</h1>
			<h2 className="text-center mb-4">
				Quickly and securely share a link or other text to another person or device.
			</h2>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(async (data) => {
						if (useClientSideEncryption && !!data.password) {
							storeTextAction({
								text: await encryptClient(data.text, data.password),
								clientSideEncryption: true,
							});
						} else {
							storeTextAction({
								text: data.text,
								clientSideEncryption: false,
							});
						}

						posthog.capture("Textsave");
					})}
				>
					<FormField
						control={form.control}
						name="text"
						render={({ field }) => (
							<FormItem>
								<FormMessage />
								<FormControl>
									<Textarea
										{...field}
										rows={6}
										className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
										placeholder="Write the text you want to share here..."
										maxLength={parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH!)}
									/>
								</FormControl>
								<FormDescription>
									<span className="text-xs italic mb-4 mt-2 text-gray-400 text-right block">
										{field.value.length}/{process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH}
									</span>
								</FormDescription>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="clientSideEncryption"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className="flex align-center gap-2 mb-4">
										<div>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => {
													form.resetField("password");
													field.onChange(checked);
												}}
												id="custom-password"
											/>
										</div>
										<label htmlFor="custom-password">Use client-side encryption (password)</label>
									</div>
								</FormControl>
							</FormItem>
						)}
					/>

					{useClientSideEncryption && (
						<FormField
							control={form.control}
							rules={{ required: true }}
							name="password"
							render={({ field }) => (
								<FormItem>
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
									<FormDescription>
										Encrypt text using a custom password. To read the text, the same password will
										be required.
										<span className="text-xs italic mb-4 mt-2 text-gray-400 text-right block">
											{field.value?.length ?? 0}/
											{process.env.NEXT_PUBLIC_MAX_TEXT_PASSWORD_LENGTH}
										</span>
									</FormDescription>
								</FormItem>
							)}
						/>
					)}

					<Button
						type="submit"
						className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
						disabled={!form.formState.isValid}
					>
						Create sharable link
					</Button>
				</form>
			</Form>

			{!useClientSideEncryption && (
				<p className="text-gray-500 mt-4 text-xs">
					<strong>
						Before being stored, this text will be server-side encrypted using the latest encryption
						algorithm.
					</strong>
				</p>
			)}

			<p className="italic text-gray-500 mt-4 text-xs">
				<strong>Important:</strong> This is not a permanent text storage solution. The saved text is temporary
				and can only be viewed once. It will be deleted after viewing or automatically after 7 days.
			</p>

			<p className="text-center mt-4">
				<Link href="/file" className="text-indigo-500 text-sm">
					Upload a file instead
				</Link>
			</p>
		</Card>
	);
}

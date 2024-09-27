"use client";

import { uploadFile } from "../helpers/file-upload";
import Link from "next/link";
import { DocumentIcon } from "./SVG/document";
import { UploadIcon } from "./SVG/upload-icon";
import Card from "./UI/card";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage, FormControl, FormDescription, FormLabel } from "@/components/ui/form";
import { formatFileSize } from "../helpers/file-size";
import { useEffect, useState } from "react";
import UploadDone from "./upload-done";
import UploadProcessing from "./upload-processing";
import UploadError from "./upload-error";
import { useAction } from "next-safe-action/hooks";
import { generatePresignedUrl } from "../file/actions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function FileUploadForm() {
	const [error, setError] = useState<string | null>(null);

	const { executeAsync: generatePresignedUrlAction, result, reset: resetAction } = useAction(generatePresignedUrl);

	const form = useForm<{ file: File }>({
		resolver: zodResolver(
			z.object({
				file: z
					.instanceof(File)
					.refine((file) => file.size <= parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!), {
						message: `File size is too large! Please make sure the file is under ${formatFileSize(
							parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!)
						)}!`,
					}),
			})
		),
	});

	const handleSubmit = async ({ file }: { file: File }) => {
		try {
			const res = await generatePresignedUrlAction({
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
			});

			if (res?.serverError) throw new Error(res.serverError);
			if (!res?.data) throw new Error();

			await uploadFile(res.data.presigned, file);
		} catch (error) {
			if (error instanceof Error && error.message) {
				return setError(error.message);
			}

			setError("An unknown error occured. Please try again.");
		}
	};

	const handleReset = () => {
		form.reset();
		resetAction();
		setError(null);
	};

	useEffect(() => {
		const subscription = form.watch(({ file }) => {
			if (file) form.trigger(["file"]);
		});
		return () => subscription.unsubscribe();
	}, [form]);

	if (!form.formState.isSubmitting && error) {
		return <UploadError error={error} onRetry={handleReset} />;
	}

	if (form.formState.isSubmitSuccessful && result.data?.file.id) {
		return <UploadDone id={result.data?.file.id} type="file" onUploadAnother={handleReset} />;
	}

	if (form.formState.isSubmitting) {
		return <UploadProcessing type="file" />;
	}

	return (
		<Card>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<h1 className="text-2xl text-center font-bold text-indigo-500 mb-2">Quickly upload a file!</h1>
					<h2 className="text-center mb-8">Quickly and securely share a file to another person or device!</h2>

					<FormField
						name="file"
						control={form.control}
						render={({ field: { value, onChange, ...fieldProps } }) => (
							<>
								{!form.formState.isValid && (
									<FormItem>
										<FormMessage />
										<FormLabel className="bg-indigo-500 text-white w-full py-3 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto cursor-pointer">
											Select File
										</FormLabel>
										<FormControl>
											<input
												{...fieldProps}
												type="file"
												className="w-full border border-solid rounded border-indigo-800 p-2 mb-4"
												hidden
												onChange={(event) =>
													onChange(event.target.files && event.target.files[0])
												}
											/>
										</FormControl>
										<FormDescription>
											Max size: {formatFileSize(parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE!))}
										</FormDescription>
									</FormItem>
								)}

								{form.formState.isValid && form.getValues("file") && (
									<div className="mb-8">
										<div className="mb-4 flex flex-col items-center">
											<DocumentIcon size={8} />
										</div>

										<h1 className="font-medium text-lg text-indigo-500 text-center mb-8 break-all text-wrap">
											{form.getValues("file").name}
										</h1>

										<button
											type="submit"
											className="bg-indigo-500 mb-3 text-white w-full p-2 rounded disabled:opacity-30 disabled:cursor-default flex justify-center gap-3 mx-auto"
										>
											<UploadIcon />
											Upload
										</button>

										<button
											type="button"
											className="block mx-auto text-gray-400 font-medium"
											onClick={handleReset}
										>
											Select other file
										</button>
									</div>
								)}
							</>
						)}
					/>

					<p className="italic text-gray-500 mt-8 text-xs">
						<strong>Important:</strong> This is not a permanent file storage solution. The uploaded file is
						temporary and can only be downloaded once. It will be deleted after download or automatically
						after 7 days.
					</p>
				</form>
			</Form>

			<p className="text-center">
				<Link href="/text" className="text-indigo-500 text-sm">
					Share text instead
				</Link>
			</p>
		</Card>
	);
}

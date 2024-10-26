import { ListObjectsV2Command, ListObjectsV2CommandOutput, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: process.env.AWS_S3_REGION,
	credentials: { accessKeyId: process.env.AWS_USER_ACCESS_KEY!, secretAccessKey: process.env.AWS_USER_SECRET_KEY! },
});

export async function s3GetBucketSize() {
	let continuationToken: string | undefined = undefined;
	let bucketSize = 0;

	do {
		const res: ListObjectsV2CommandOutput = await s3.send(
			new ListObjectsV2Command({
				Bucket: process.env.AWS_S3_BUCKET,
				ContinuationToken: continuationToken,
			})
		);

		continuationToken = res.NextContinuationToken;
		res.Contents?.forEach((c) => {
			bucketSize += c.Size ?? 0;
		});
	} while (continuationToken);

	return bucketSize;
}

export default s3;

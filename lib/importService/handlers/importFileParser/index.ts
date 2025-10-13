import { S3Handler } from "aws-lambda";
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import csv from "csv-parser";
import { SQS } from "@aws-sdk/client-sqs";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const sqsClient = new SQS({ region: process.env.AWS_REGION });

export const main: S3Handler = async (event, context) => {
	console.log("Event: ", event);
	console.log("Context: ", context);

	if (!process.env.UPLOADED_PREFIX || !process.env.PARSED_PREFIX || !process.env.SQS_QUEUE_URL) {
		throw new Error("Not all required environment variables were set");
	}

	const bucketName = event.Records[0].s3.bucket.name;
	const key = event.Records[0].s3.object.key;

	const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
	const response = await s3Client.send(command);
	const stream = response.Body as Readable;

	const records: Promise<unknown>[] = [];

	await new Promise<void>((resolve, reject) => {
		stream
			.pipe(csv())
			.on("data", (data) => {
				records.push(data);
			})
			.on("end", async () => {
				console.log("Finished parsing file:", key);

				console.log(`Sending records to SQS '${process.env.SQS_QUEUE_URL}'`);
				await Promise.all(
					records.map(async (record) => {
						const params = {
							QueueUrl: process.env.SQS_QUEUE_URL,
							MessageBody: JSON.stringify(record),
						};

						return sqsClient.sendMessage(params);
					})
				);
				console.log(`All records were sent to SQS '${process.env.SQS_QUEUE_URL}'`);

				resolve();
			})
			.on("error", (err) => {
				console.error("Error parsing CSV:", err);

				reject(err);
			});
	});

	const copyCommand = new CopyObjectCommand({
		Bucket: bucketName,
		CopySource: `${bucketName}/${key}`,
		Key: key.replace(process.env.UPLOADED_PREFIX, process.env.PARSED_PREFIX),
	});
	await s3Client.send(copyCommand);

	const deleteCommand = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
	await s3Client.send(deleteCommand);

	console.log("File moved to parsed folder and original deleted:", key);
};

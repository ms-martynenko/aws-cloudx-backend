import { SQSHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNS } from "@aws-sdk/client-sns";
import { CreatedProductData, InitialProductData } from "../../../../types/Product";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocument.from(dynamoClient);
const snsClient = new SNS({ region: process.env.AWS_REGION });

export const main: SQSHandler = async (event, context) => {
	console.log("Event: ", event);
	console.log("Context: ", context);

	if (
		!process.env.PRODUCTS_TABLE_NAME ||
		!process.env.STOCKS_TABLE_NAME ||
		!process.env.SNS_TOPIC_ARN
	) {
		throw new Error("Not all required environment variables were set");
	}

	try {
		const processedProducts: CreatedProductData[] = [];

		for (const record of event.Records) {
			console.log("Processing SQS record:", record.messageId);

			const productData: InitialProductData = JSON.parse(record.body);
			const generatedId = uuidv4();

			await docClient.put({
				TableName: process.env.PRODUCTS_TABLE_NAME,
				Item: {
					id: generatedId,
					title: productData.title,
					description: productData.description,
					price: productData.price,
				},
			});

			await docClient.put({
				TableName: process.env.STOCKS_TABLE_NAME,
				Item: {
					product_id: generatedId,
					count: productData.count,
				},
			});

			processedProducts.push({ id: generatedId, ...productData });
			console.log("Successfully created product:", generatedId);
		}

		for (const product of processedProducts) {
			const message = {
				message: "New product has been created",
				productId: product.id,
				title: product.title,
				price: product.price,
				stock: product.count,
			};

			await snsClient.publish({
				TopicArn: process.env.SNS_TOPIC_ARN,
				Message: JSON.stringify(message, null, 2),
				Subject: `New product has been created: ${product.title}`,
				MessageAttributes: {
					stock: {
						DataType: "Number",
						StringValue: product.count.toString(),
					},
				},
			});
		}
	} catch (error) {
		console.error("Error:", error);

		throw error;
	}
};

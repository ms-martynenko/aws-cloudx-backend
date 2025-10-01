import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDBDocClient = DynamoDBDocument.from(client);
const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = process.env;

export const main: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
	event,
	context
) => {
	console.log("Event:", JSON.stringify(event, null, 2));
	console.log("Context:", JSON.stringify(context, null, 2));

	try {
		const productsResult = await dynamoDBDocClient.scan({
			TableName: PRODUCTS_TABLE_NAME,
		});

		if (!productsResult.Items?.length) {
			return createResponse(200, []);
		}

		const stocksResult = await dynamoDBDocClient.scan({
			TableName: STOCKS_TABLE_NAME,
		});

		const stockMap = new Map();

		if (stocksResult.Items?.length) {
			stocksResult.Items.forEach((stock) => {
				stockMap.set(stock.product_id, stock.count);
			});
		}

		const productsWithStock = productsResult.Items.map((product) => ({
			...product,
			count: stockMap.get(product.id) ?? 0,
		}));

		return createResponse(200, productsWithStock);
	} catch (error) {
		console.error("Error retrieving products:", error);

		return createResponse(500, {
			message: "Internal server error",
		});
	}
};

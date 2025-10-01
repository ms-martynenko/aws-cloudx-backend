import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { createResponse } from "../utils";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDBDocClient = DynamoDBDocument.from(client);
const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = process.env;

export const main: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
	event,
	context
) => {
	console.log("Event: ", event);
	console.log("Context: ", context);

	const productId = event.pathParameters?.productId;

	try {
		const productResponse = await dynamoDBDocClient.get({
			TableName: PRODUCTS_TABLE_NAME,
			Key: {
				id: productId,
			},
		});

		if (!productResponse?.Item) {
			return createResponse(404, {
				data: {
					message: `Product with ID '${productId}' not found`,
				},
			});
		}

		const productStock = await dynamoDBDocClient.get({
			TableName: STOCKS_TABLE_NAME,
			Key: {
				product_id: productId,
			},
		});

		const productWithStock = {
			...productResponse.Item,
			count: productStock.Item?.count ?? 0,
		};

		return createResponse(200, productWithStock);
	} catch (error) {
		console.error("Error retrieving product:", error);

		return createResponse(500, {
			data: {
				message: "Internal server error",
			},
		});
	}
};

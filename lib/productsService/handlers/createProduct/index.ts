import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import Joi from "joi";
import { createResponse } from "../../../../utils";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDBDocClient = DynamoDBDocument.from(client);

const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = process.env;

const validationSchema = Joi.object({
	title: Joi.string().min(1).max(100).required(),
	description: Joi.string().min(1).max(1000).required(),
	price: Joi.number().positive().required(),
	count: Joi.number().integer().min(1).required(),
});

export const main: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
	event,
	context
) => {
	console.log("Event: ", event);
	console.log("Context: ", context);

	if (!event.body) {
		return createResponse(400, {
			data: {
				message: "Request body is required",
			},
		});
	}

	try {
		const body = JSON.parse(event.body);

		await validationSchema.validateAsync(body);

		const generatedId = uuidv4();

		await dynamoDBDocClient.transactWrite({
			TransactItems: [
				{
					Put: {
						TableName: PRODUCTS_TABLE_NAME,
						Item: {
							id: generatedId,
							title: body.title,
							description: body.description,
							price: body.price,
						},
					},
				},
				{
					Put: {
						TableName: STOCKS_TABLE_NAME,
						Item: {
							product_id: generatedId,
							count: body.count,
						},
					},
				},
			],
		});

		return createResponse(201, {
			data: {
				message: "Product created successfully",
				productId: generatedId,
			},
		});
	} catch (error) {
		console.error("Error:", error);

		if (error instanceof Joi.ValidationError) {
			return createResponse(400, { data: { message: error.message } });
		}

		return createResponse(500, { data: { message: "Internal server error" } });
	}
};

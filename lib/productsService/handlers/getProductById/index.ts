import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { products } from "../../../../mocks";
import { createResponse } from "../utils";

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	const productId = event.pathParameters?.productId;

	const product = products.find((p) => p.id === productId);

	if (!product) {
		return createResponse(404, {
			message: `Product with ID '${productId}' not found`,
		});
	}

	return createResponse(200, product);
}

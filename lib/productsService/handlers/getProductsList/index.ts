import { APIGatewayProxyResult } from "aws-lambda";
import { products } from "../../../../mocks";
import { createResponse } from "../utils";

export async function main(): Promise<APIGatewayProxyResult> {
	return createResponse(200, products);
}

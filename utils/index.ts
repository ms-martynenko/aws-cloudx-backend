import { FRONTEND_URL } from "../constants";

export function createResponse(statusCode: number, body: unknown) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": FRONTEND_URL,
			"Access-Control-Allow-Headers":
				"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		},
		body: JSON.stringify(body),
	};
}

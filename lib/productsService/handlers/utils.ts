export function createResponse(statusCode: number, body: any) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "https://d3nvqppy8bkguw.cloudfront.net",
			"Access-Control-Allow-Headers":
				"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		},
		body: JSON.stringify(body),
	};
}

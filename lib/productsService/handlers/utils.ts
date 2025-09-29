export function createResponse(statusCode: number, body: any) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "https://d3nvqppy8bkguw.cloudfront.net",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
		},
		body: JSON.stringify(body),
	};
}

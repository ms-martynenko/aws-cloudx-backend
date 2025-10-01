import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { products, productsStocks } from "../mocks";
import { TABLE_NAMES } from "../constants";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamoDBDocClient = DynamoDBDocument.from(new DynamoDBClient());

async function seed() {
	console.log("Started seeding process...");

	try {
		for (const [index, product] of products.entries()) {
			const stock = productsStocks[index];

			await dynamoDBDocClient.put({
				TableName: TABLE_NAMES.PRODUCTS,
				Item: {
					id: product.id,
					title: product.title,
					description: product.description,
					price: product.price,
				},
			});
			console.log(`Seeded product with id: ${product.id}`);

			await dynamoDBDocClient.put({
				TableName: TABLE_NAMES.STOCKS,
				Item: {
					product_id: stock.product_id,
					count: stock.count,
				},
			});
			console.log(`Seeded stock for product id: ${stock.product_id}`);
		}
		console.log("Seeding process completed.");
	} catch (error) {
		console.error("Error seeding data:", error);
	}
}

seed().catch((err) => console.error("Error in seeding process:", err));

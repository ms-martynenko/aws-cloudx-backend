import { aws_apigateway, aws_dynamodb, aws_lambda, Duration } from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import { FRONTEND_URL, TABLE_NAMES } from "../../constants";

export class ProductsService extends Construct {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const productsTable = new aws_dynamodb.Table(this, "ProductsTable", {
			tableName: TABLE_NAMES.PRODUCTS,
			partitionKey: {
				name: "id",
				type: aws_dynamodb.AttributeType.STRING,
			},
		});

		const stockTable = new aws_dynamodb.Table(this, "StocksTable", {
			tableName: TABLE_NAMES.STOCKS,
			partitionKey: {
				name: "product_id",
				type: aws_dynamodb.AttributeType.STRING,
			},
		});

		const lambdaGetProducts = new aws_lambda.Function(this, "getProducts", {
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: "index.main",
			code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/getProductsList")),
			environment: {
				PRODUCTS_TABLE_NAME: TABLE_NAMES.PRODUCTS,
				STOCKS_TABLE_NAME: TABLE_NAMES.STOCKS,
			},
		});

		const lambdaGetProductById = new aws_lambda.Function(this, "getProductById", {
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: "index.main",
			code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/getProductById")),
			environment: {
				PRODUCTS_TABLE_NAME: TABLE_NAMES.PRODUCTS,
				STOCKS_TABLE_NAME: TABLE_NAMES.STOCKS,
			},
		});

		const lambdaCreateProduct = new aws_lambda.Function(this, "createProduct", {
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: "index.main",
			code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/createProduct")),
			environment: {
				PRODUCTS_TABLE_NAME: TABLE_NAMES.PRODUCTS,
				STOCKS_TABLE_NAME: TABLE_NAMES.STOCKS,
			},
		});

		productsTable.grantReadData(lambdaGetProducts);
		productsTable.grantReadData(lambdaGetProductById);
		productsTable.grantWriteData(lambdaCreateProduct);

		stockTable.grantReadData(lambdaGetProducts);
		stockTable.grantReadData(lambdaGetProductById);
		stockTable.grantWriteData(lambdaCreateProduct);

		const api = new aws_apigateway.RestApi(this, "ProductsAPI", {
			restApiName: "Products API",
			description: "APIs for products",
			defaultCorsPreflightOptions: {
				allowOrigins: [FRONTEND_URL],
				allowMethods: ["GET", "POST", "OPTIONS"],
				allowHeaders: ["Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"],
			},
		});

		const productsResource = api.root.addResource("products");
		const productsLambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaGetProducts);
		productsResource.addMethod("GET", productsLambdaIntegration);

		const productIdResource = productsResource.addResource("{productId}");
		const productIdLambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaGetProductById);
		productIdResource.addMethod("GET", productIdLambdaIntegration);

		const createProductLambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaCreateProduct);
		productsResource.addMethod("POST", createProductLambdaIntegration);
	}
}

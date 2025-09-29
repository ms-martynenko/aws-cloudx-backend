import { aws_apigateway, aws_lambda, Duration } from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";

export class ProductsService extends Construct {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const lambdaGetProducts = new aws_lambda.Function(this, "getProducts", {
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: "index.main",
			code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/getProductsList")),
		});

		const lambdaGetProductById = new aws_lambda.Function(this, "getProductById", {
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 1024,
			timeout: Duration.seconds(5),
			handler: "index.main",
			code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/getProductById")),
		});

		const api = new aws_apigateway.RestApi(this, "ProductsAPI", {
			restApiName: "Products API",
			description: "APIs for products",
			defaultCorsPreflightOptions: {
				allowOrigins: ["https://d3nvqppy8bkguw.cloudfront.net"],
				allowMethods: ["GET", "OPTIONS"],
				allowHeaders: ["Content-Type"],
			},
		});

		const productsResource = api.root.addResource("products");
		const productsLambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaGetProducts);
		productsResource.addMethod("GET", productsLambdaIntegration);

		const productIdResource = productsResource.addResource("{productId}");
		const productIdLambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaGetProductById);
		productIdResource.addMethod("GET", productIdLambdaIntegration);
	}
}

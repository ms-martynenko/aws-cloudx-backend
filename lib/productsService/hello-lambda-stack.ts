import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProductsService } from "./products-service";

export class HelloLambdaStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		new ProductsService(this, "ProductsService");
	}
}

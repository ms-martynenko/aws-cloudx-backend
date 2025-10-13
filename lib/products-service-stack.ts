import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProductsService } from "./productsService";

export class ProductsServiceStack extends Stack {
	public readonly productsService: ProductsService;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.productsService = new ProductsService(this, "ProductsService");
	}
}

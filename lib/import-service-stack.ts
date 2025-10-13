import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ImportService } from "./importService/import-service";

export class ImportServiceStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		new ImportService(this, "ImportService");
	}
}

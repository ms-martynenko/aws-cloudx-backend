import { Stack, StackProps, aws_sqs, aws_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ImportService } from "./importService/import-service";

export interface ImportServiceStackProps extends StackProps {
  catalogItemsQueue: aws_sqs.Queue;
  authorizerFunction: aws_lambda.Function;
}

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: ImportServiceStackProps) {
    super(scope, id, props);

    new ImportService(this, "ImportService", {
      catalogItemsQueue: props.catalogItemsQueue,
      authorizerFunction: props.authorizerFunction,
    });
  }
}
